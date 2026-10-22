package org.scratchjr.android.utils

import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class WebSecurityUtilsTest {

    @Test
    fun `isAppAssetHost returns true for exact and case-insensitive match`() {
        assertTrue(WebSecurityUtils.isAppAssetHost("appassets.androidplatform.net"))
        assertTrue(WebSecurityUtils.isAppAssetHost("APPASSETS.ANDROIDPLATFORM.NET"))
        assertTrue(WebSecurityUtils.isAppAssetHost("AppAssets.AndroidPlatform.Net"))
    }

    @Test
    fun `isAppAssetHost returns false for foreign or null hosts`() {
        assertFalse(WebSecurityUtils.isAppAssetHost(null))
        assertFalse(WebSecurityUtils.isAppAssetHost(""))
        assertFalse(WebSecurityUtils.isAppAssetHost("google.com"))
        assertFalse(WebSecurityUtils.isAppAssetHost("evil-appassets.androidplatform.net"))
        assertFalse(WebSecurityUtils.isAppAssetHost("attacker.com"))
    }

    @Test
    fun `isAppAssetUrl returns true for valid app asset URLs`() {
        assertTrue(WebSecurityUtils.isAppAssetUrl("https://appassets.androidplatform.net/assets/www/index.html"))
        assertTrue(WebSecurityUtils.isAppAssetUrl("https://appassets.androidplatform.net/assets/www/editor.html"))
        assertTrue(WebSecurityUtils.isAppAssetUrl("http://appassets.androidplatform.net/foo"))
    }

    @Test
    fun `isAppAssetUrl returns false for external URLs and invalid inputs`() {
        assertFalse(WebSecurityUtils.isAppAssetUrl(null))
        assertFalse(WebSecurityUtils.isAppAssetUrl(""))
        assertFalse(WebSecurityUtils.isAppAssetUrl("https://google.com/search"))
        assertFalse(WebSecurityUtils.isAppAssetUrl("http://localhost:8080/"))
        assertFalse(WebSecurityUtils.isAppAssetUrl("javascript:alert(1)"))
        assertFalse(WebSecurityUtils.isAppAssetUrl("not a valid url"))
    }
}
