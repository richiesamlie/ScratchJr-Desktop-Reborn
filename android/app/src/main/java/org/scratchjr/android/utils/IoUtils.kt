package org.scratchjr.android.utils

import java.io.ByteArrayOutputStream
import java.io.InputStream

object IoUtils {
    const val MAX_SJR_BYTES: Int = 50 * 1024 * 1024 // 50 MB

    /**
     * Reads up to [maxBytes] from [inputStream].
     * If the stream exceeds [maxBytes], closes/aborts and returns null.
     */
    fun readBounded(inputStream: InputStream, maxBytes: Int = MAX_SJR_BYTES): ByteArray? {
        val buffer = ByteArray(8192)
        val output = ByteArrayOutputStream()
        var total = 0

        var read: Int
        while (inputStream.read(buffer).also { read = it } != -1) {
            total += read
            if (total > maxBytes) {
                return null
            }
            output.write(buffer, 0, read)
        }
        return output.toByteArray()
    }
}
