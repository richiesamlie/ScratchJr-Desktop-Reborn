package org.scratchjr.android.utils

import java.security.MessageDigest

object CryptoUtils {
    /**
     * Compute MD5 hash of input text or base64 data.
     * Returns 32-character hexadecimal lowercase string.
     */
    fun md5(input: String): String {
        val md = MessageDigest.getInstance("MD5")
        val digest = md.digest(input.toByteArray(Charsets.UTF_8))
        val sb = StringBuilder()
        for (b in digest) {
            sb.append(String.format("%02x", b))
        }
        return sb.toString()
    }
}
