import {preprocessAndLoadCss} from './src/utils/lib';
import Localization from './src/utils/Localization';
import AppUsage from './src/utils/AppUsage';
import PlatformBridge from './src/platform/PlatformBridge';
import IO from './src/platform/IO';
import MediaLib from './src/platform/MediaLib';

/** @param {string} settingsRoot @param {() => void} whenDone */
function loadSettings (settingsRoot, whenDone) {
	IO.requestFromServer(settingsRoot + 'settings.json', (result) => {
		window.Settings = JSON.parse(result);
		whenDone();
	});
}

// Per-page entry loaders. Dynamically imported so esbuild code-splitting puts
// each page's code in its own chunk: the lobby never parses the editor engine,
// and vice versa. The in-app help pages call loadPage('inapp*') at runtime
// (see Lobby.loadLink), so those chunks are pulled on demand too.
const pageEntries = {
	index: () => import('./src/entry/index').then((m) => PlatformBridge.waitForInterface(m.indexMain)),
	home: () => import('./src/entry/home').then((m) => PlatformBridge.waitForInterface(m.homeMain)),
	editor: () => import('./src/entry/editor').then((m) => PlatformBridge.waitForInterface(m.editorMain)),
	gettingStarted: () => import('./src/entry/gettingstarted').then((m) => PlatformBridge.waitForInterface(m.gettingStartedMain)),
	inappAbout: () => import('./src/entry/inapp').then((m) => m.inappAbout()),
	inappInterfaceGuide: () => import('./src/entry/inapp').then((m) => m.inappInterfaceGuide()),
	inappPaintEditorGuide: () => import('./src/entry/inapp').then((m) => m.inappPaintEditorGuide()),
	inappBlocksGuide: () => import('./src/entry/inapp').then((m) => m.inappBlocksGuide()),
};

/**
 * Runtime bootstrap: page-dispatch hook plus the close handshake. Called once
 * from renderer-entry.js; kept out of module scope so importing loadPage
 * (e.g. from the lobby) has no side effects.
 */
export function bootApp () {
	window.onload = () => loadPage(document.body.dataset.scratchjrPage || window.scratchJrPage || '').catch((err) => console.error('loadPage failed:', err)); // eslint-disable-line no-console

	// Close handshake lives here (not in the editor chunk) so quitting from any
	// page acks immediately; the editor chunk saves first via window.ScratchJr.
	if (typeof window !== 'undefined' && window.scratchjr) {
		const ipc = window.scratchjr;
		ipc.onAppClose(function () {
			if (window.ScratchJr && window.ScratchJr.saveProject) {
				window.ScratchJr.saveProject(null, function () { ipc.sendAppClosedAcked(); });
			} else {
				ipc.sendAppClosedAcked();
			}
		});
	}
}



/** @param {string} page */
export async function loadPage(page) {
	// Root directory for includes. Needed in case we are in the inapp-help
	// directory (and root becomes '../')
	let root = './';

	// Load CSS per page
	switch (page) {
	default:
	case 'index':
		// Index page (splash screen)
		await preprocessAndLoadCss('css', 'css/font.css');
		await preprocessAndLoadCss('css', 'css/base.css');
		await preprocessAndLoadCss('css', 'css/start.css');
		await preprocessAndLoadCss('css', 'css/thumbs.css');
		/* For parental gate. These CSS properties should be refactored */
		await preprocessAndLoadCss('css', 'css/editor.css');
		break;
	case 'home':
		// Lobby pages
		await preprocessAndLoadCss('css', 'css/font.css');
		await preprocessAndLoadCss('css', 'css/base.css');
		await preprocessAndLoadCss('css', 'css/lobby.css');
		await preprocessAndLoadCss('css', 'css/thumbs.css');
		break;
	case 'editor':
		// Editor pages
		await preprocessAndLoadCss('css', 'css/font.css');
		await preprocessAndLoadCss('css', 'css/base.css');
		await preprocessAndLoadCss('css', 'css/editor.css');
		await preprocessAndLoadCss('css', 'css/editorleftpanel.css');
		await preprocessAndLoadCss('css', 'css/editorstage.css');
		await preprocessAndLoadCss('css', 'css/editormodal.css');
		await preprocessAndLoadCss('css', 'css/librarymodal.css');
		await preprocessAndLoadCss('css', 'css/paintlook.css');
		break;
	case 'gettingStarted':
		// Getting started video page
		await preprocessAndLoadCss('css', 'css/font.css');
		await preprocessAndLoadCss('css', 'css/base.css');
		await preprocessAndLoadCss('css', 'css/gs.css');
		break;
	case 'inappAbout':
		// About ScratchJr in-app help frame
		await preprocessAndLoadCss('style', 'inapp/style/about.css');
		break;
	case 'inappInterfaceGuide':
		// Interface guide in-app help frame
		await preprocessAndLoadCss('style', 'inapp/style/interface.css');
		break;
	case 'inappPaintEditorGuide':
		// Paint editor guide in-app help frame
		await preprocessAndLoadCss('style', 'inapp/style/paint.css');
		break;
	case 'inappBlocksGuide':
		// Blocks guide in-app help frame
		await preprocessAndLoadCss('style', 'inapp/style/blocks.css');
		break;
	}

	// Start up sequence
	// Load settings from JSON
	loadSettings(root, () => {
		// Load locale strings from JSON (--lang=xx CLI flag or localStorage or browser default)
		Localization.includeLocales(root, () => {
			// Load Media Lib from JSON
			MediaLib.loadMediaLib(root, () => {
				const entries = /** @type {Record<string, () => Promise<void>>} */ (pageEntries);
				const entry = entries[page] || entries.index;
				entry();
			});
		});
		// Initialize currentUsage data
		AppUsage.initUsage();
	});
}
