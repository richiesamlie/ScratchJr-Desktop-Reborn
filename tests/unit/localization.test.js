// @vitest-environment jsdom
import './renderer-harness.js';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Localization from '../../src/app/src/utils/Localization';
import settingsJson from '../../src/app/settings.json';

describe('Localization — determineLocaleFromBrowser (Finding F1 verification)', () => {
    let originalNavigator;
    let originalSettings;

    beforeEach(() => {
        originalSettings = window.Settings;
        window.Settings = {
            defaultLocale: settingsJson.defaultLocale,
            supportedLocales: settingsJson.supportedLocales,
        };
    });

    afterEach(() => {
        window.Settings = originalSettings;
    });

    function setBrowserLanguage(lang) {
        Object.defineProperty(window.navigator, 'language', {
            value: lang,
            configurable: true,
        });
        Object.defineProperty(window.navigator, 'userLanguage', {
            value: undefined,
            configurable: true,
        });
    }

    it('resolves single-subtag browser language to exact supported locale (F1 root fix)', () => {
        setBrowserLanguage('fr');
        expect(Localization.determineLocaleFromBrowser()).toBe('fr');

        setBrowserLanguage('de');
        expect(Localization.determineLocaleFromBrowser()).toBe('de');

        setBrowserLanguage('es');
        expect(Localization.determineLocaleFromBrowser()).toBe('es');

        setBrowserLanguage('ja');
        expect(Localization.determineLocaleFromBrowser()).toBe('ja');
    });

    it('resolves hyphenated dialect to supported base language prefix', () => {
        setBrowserLanguage('fr-FR');
        expect(Localization.determineLocaleFromBrowser()).toBe('fr');

        setBrowserLanguage('fr-CA');
        expect(Localization.determineLocaleFromBrowser()).toBe('fr');

        setBrowserLanguage('en-US');
        expect(Localization.determineLocaleFromBrowser()).toBe('en');

        setBrowserLanguage('en-GB');
        expect(Localization.determineLocaleFromBrowser()).toBe('en');

        setBrowserLanguage('es-MX');
        expect(Localization.determineLocaleFromBrowser()).toBe('es');

        setBrowserLanguage('de-AT');
        expect(Localization.determineLocaleFromBrowser()).toBe('de');

        setBrowserLanguage('pt-BR');
        expect(Localization.determineLocaleFromBrowser()).toBe('pt');
    });

    it('resolves multi-subtag exact match and prefix fallback (e.g. zh-CN / zh)', () => {
        setBrowserLanguage('zh-cn');
        expect(Localization.determineLocaleFromBrowser()).toBe('zh-cn');

        setBrowserLanguage('zh-CN');
        expect(Localization.determineLocaleFromBrowser()).toBe('zh-cn');

        setBrowserLanguage('zh');
        expect(Localization.determineLocaleFromBrowser()).toBe('zh-cn');

        setBrowserLanguage('zh-TW');
        expect(Localization.determineLocaleFromBrowser()).toBe('zh-cn');
    });

    it('falls back to defaultLocale for unsupported languages', () => {
        setBrowserLanguage('ko-KR');
        expect(Localization.determineLocaleFromBrowser()).toBe('en');

        setBrowserLanguage('ru');
        expect(Localization.determineLocaleFromBrowser()).toBe('en');

        setBrowserLanguage('unknown-LOCALE');
        expect(Localization.determineLocaleFromBrowser()).toBe('en');
    });

    it('handles legacy IE userLanguage property if language is missing', () => {
        Object.defineProperty(window.navigator, 'language', {
            value: '',
            configurable: true,
        });
        Object.defineProperty(window.navigator, 'userLanguage', {
            value: 'it-IT',
            configurable: true,
        });
        expect(Localization.determineLocaleFromBrowser()).toBe('it');
    });

    it('gracefully handles missing window.Settings without throwing', () => {
        window.Settings = undefined;
        setBrowserLanguage('fr');
        expect(Localization.determineLocaleFromBrowser()).toBe('en');
    });
});
