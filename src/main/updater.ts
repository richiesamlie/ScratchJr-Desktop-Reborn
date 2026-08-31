/**
 * Update checker module for ScratchJr Desktop.
 *
 * Checks GitHub releases API for the latest version and compares
 * with the current version. Returns update info for the renderer.
 */

import fs from 'fs';
import path from 'path';
import { app, shell, BrowserWindow } from 'electron';
import { debugLog } from './logging';

const REPO_OWNER = 'richiesamlie';
const REPO_NAME = 'ScratchJr-Desktop-Reborn';
const CHECK_TIMEOUT_MS = 10_000;

export interface UpdateInfo {
    available: boolean;
    currentVersion: string;
    latestVersion: string;
    downloadUrl: string;
    releasePageUrl: string;
    releaseNotes: string;
    error?: string;
}

interface CachedRelease {
    etag: string | null;
    release?: {
        tag_name: string;
        body?: string;
        assets?: { name: string; browser_download_url: string }[];
    };
}

/**
 * ETag cache: GitHub serves 304 responses free of charge against the
 * unauthenticated rate limit, so repeat checks cost nothing until a new
 * release actually lands.
 */
function etagCachePath (): string {
    return path.join(app.getPath('userData'), 'update-cache.json');
}

function loadEtagCache (): CachedRelease {
    try {
        const raw = JSON.parse(fs.readFileSync(etagCachePath(), 'utf8')) as CachedRelease;
        if (raw && typeof raw === 'object') return raw;
    } catch (_) { /* no cache yet */ }
    return { etag: null };
}

function saveEtagCache (cache: CachedRelease): void {
    try {
        fs.writeFileSync(etagCachePath(), JSON.stringify(cache));
    } catch (e) {
        debugLog('update cache write failed:', e);
    }
}

/**
 * Compare two semver strings. Returns:
 *   -1 if a < b, 0 if equal, 1 if a > b
 *
 * Prerelease suffixes (e.g. "1.7.0-beta") are stripped before comparing the
 * numeric parts: a prerelease of a higher version still counts as an update,
 * and a prerelease of the current version does not. Previously `Number()` on
 * the suffix produced NaN and NaN comparisons silently reported "no update".
 */
export function compareVersions(a: string, b: string): number {
    const numeric = (v: string) =>
        v.split('-')[0].split('.').map((n) => parseInt(n, 10) || 0);
    const pa = numeric(a);
    const pb = numeric(b);
    for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
        const na = pa[i] || 0;
        const nb = pb[i] || 0;
        if (na < nb) return -1;
        if (na > nb) return 1;
    }
    return 0;
}

const CDN_URLS = [
    `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/master/version.json`,
    `https://cdn.jsdelivr.net/gh/${REPO_OWNER}/${REPO_NAME}@master/version.json`,
    `https://${REPO_OWNER}.github.io/${REPO_NAME}/version.json`,
];
const FALLBACK_API_URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases/latest`;

interface StaticVersionManifest {
    version: string;
    name?: string;
    notes?: string;
    pub_date?: string;
    release_url?: string;
    downloads?: Record<string, string>;
}

/**
 * Check for updates.
 *
 * Uses a tiered approach:
 * 1. Primary: Fetches static version.json from resilient CDN endpoints (Fastly / jsDelivr / GitHub Pages - unlimited rate limit, zero quota cost).
 * 2. Fallback: Fetches GitHub Releases API with ETag conditional caching.
 */
export async function checkForUpdate(): Promise<UpdateInfo> {
    const currentVersion = app.getVersion();
    const releasePageUrl = `https://github.com/${REPO_OWNER}/${REPO_NAME}/releases/latest`;

    const defaultResult: UpdateInfo = {
        available: false,
        currentVersion,
        latestVersion: currentVersion,
        downloadUrl: '',
        releasePageUrl,
        releaseNotes: '',
    };

    // Tier 1: Try static CDN endpoints first (rate-limit free)
    for (const cdnUrl of CDN_URLS) {
        try {
            const cdnController = new AbortController();
            const cdnTimeout = setTimeout(() => cdnController.abort(), 4_000);

            const cdnResponse = await fetch(cdnUrl, {
                signal: cdnController.signal,
                headers: {
                    'User-Agent': `ScratchJr-Desktop/${currentVersion} (${process.platform})`,
                },
            });
            clearTimeout(cdnTimeout);

            if (cdnResponse.ok) {
                const manifest = await cdnResponse.json() as StaticVersionManifest;
                if (manifest && typeof manifest.version === 'string') {
                    const latestVersion = manifest.version.replace(/^v/, '');
                    const available = compareVersions(latestVersion, currentVersion) > 0;
                    
                    // Select platform download asset from manifest
                    let downloadUrl = manifest.release_url || releasePageUrl;
                    if (manifest.downloads) {
                        const platform = process.platform;
                        const arch = process.arch;
                        const key = platform === 'win32'
                            ? (manifest.downloads['win32-x64-msi'] ? 'win32-x64-msi' : 'win32-x64')
                            : `${platform}-${arch}`;
                        if (manifest.downloads[key]) {
                            downloadUrl = manifest.downloads[key];
                        }
                    }

                    debugLog(`CDN Update check (${cdnUrl}): ${currentVersion} -> ${latestVersion} (available: ${available})`);
                    return {
                        available,
                        currentVersion,
                        latestVersion,
                        downloadUrl,
                        releasePageUrl: manifest.release_url || releasePageUrl,
                        releaseNotes: manifest.notes || '',
                    };
                }
            }
        } catch (cdnErr) {
            debugLog(`CDN Update check failed for ${cdnUrl}:`, cdnErr);
        }
    }

    // Tier 2: Fallback to GitHub Releases API with ETag caching
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS);

        const headers: Record<string, string> = {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': `ScratchJr-Desktop/${currentVersion} (${process.platform})`,
        };
        let cached = loadEtagCache();
        if (cached.etag) {
            // 304 responses are not counted against the unauthenticated quota.
            headers['If-None-Match'] = cached.etag;
        }

        const response = await fetch(FALLBACK_API_URL, {
            signal: controller.signal,
            headers,
        });
        clearTimeout(timeout);

        if (response.status === 304 && cached.release) {
            debugLog('Update check: release unchanged (304, rate-limit free)');
            return buildUpdateInfo(cached.release, currentVersion, releasePageUrl);
        }

        if (!response.ok) {
            const remaining = response.headers.get('x-ratelimit-remaining');
            debugLog('Update check failed: HTTP', response.status, remaining !== null ? `(quota left: ${remaining})` : '');
            if (response.status === 403 && remaining === '0') {
                return {
                    ...defaultResult,
                    error: 'GitHub API rate limit reached. Please try again later or visit the releases page.',
                };
            }
            return {
                ...defaultResult,
                error: `Unable to check for updates (HTTP ${response.status}).`,
            };
        }

        const release = await response.json() as CachedRelease['release'];
        if (!release || typeof release.tag_name !== 'string') {
            debugLog('Update check: malformed release payload');
            return defaultResult;
        }

        cached = { etag: response.headers.get('etag'), release };
        saveEtagCache(cached);

        return buildUpdateInfo(release, currentVersion, releasePageUrl);
    } catch (err) {
        debugLog('Update check error:', err);
        return {
            ...defaultResult,
            error: 'Could not connect to update server. Please check your internet connection.',
        };
    }
}

/** Pick the platform download URL and compare versions for a known release. */
function buildUpdateInfo (
    release: NonNullable<CachedRelease['release']>,
    currentVersion: string,
    releasePageUrl: string
): UpdateInfo {
    const latestVersion = release.tag_name.replace(/^v/, '');

    // Find the platform-appropriate download URL
    let downloadUrl = releasePageUrl; // fallback to release page
    if (release.assets && release.assets.length > 0) {
        const platform = process.platform;
        const arch = process.arch;

        // Pick the best matching asset
        let assetName: string | null = null;
        if (platform === 'win32') {
            assetName = 'ScratchJr-win32-x64.zip';
        } else if (platform === 'darwin') {
            assetName = arch === 'arm64'
                ? 'ScratchJr-darwin-arm64.zip'
                : 'ScratchJr-darwin-x64.zip';
        } else if (platform === 'linux') {
            assetName = arch === 'arm64'
                ? 'ScratchJr-linux-arm64.zip'
                : 'ScratchJr-linux-x64.zip';
        }

        if (assetName) {
            const asset = release.assets.find((a) => a.name === assetName);
            if (asset) {
                downloadUrl = asset.browser_download_url;
            }
        }
    }

    const available = compareVersions(latestVersion, currentVersion) > 0;

    if (available) {
        debugLog(`Update available: ${currentVersion} → ${latestVersion}`);
    } else {
        debugLog(`App is up to date (${currentVersion})`);
    }

    return {
        available,
        currentVersion,
        latestVersion,
        downloadUrl,
        releasePageUrl,
        releaseNotes: release.body || '',
    };
}

/**
 * Open a URL in the default browser.
 */
export function openExternalUrl(url: string): void {
    shell.openExternal(url).catch((err) => {
        debugLog('Failed to open URL:', url, err);
    });
}
