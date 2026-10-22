package org.scratchjr.android.utils

import java.net.URI

object WebSecurityUtils {
    const val APP_ASSET_HOST = "appassets.androidplatform.net"

    fun isAppAssetHost(host: String?): Boolean {
        if (host == null) return false
        return host.equals(APP_ASSET_HOST, ignoreCase = true)
    }

    fun isAppAssetUrl(urlString: String?): Boolean {
        if (urlString.isNullOrBlank()) return false
        return try {
            val uri = URI(urlString)
            isAppAssetHost(uri.host)
        } catch (_: Exception) {
            false
        }
    }
}
