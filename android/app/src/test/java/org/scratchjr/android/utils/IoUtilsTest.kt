package org.scratchjr.android.utils

import org.junit.Assert.assertArrayEquals
import org.junit.Assert.assertNull
import org.junit.Test
import java.io.ByteArrayInputStream

class IoUtilsTest {

    @Test
    fun testReadBoundedWithinLimit() {
        val sampleData = "Hello ScratchJr".toByteArray(Charsets.UTF_8)
        val inputStream = ByteArrayInputStream(sampleData)
        val result = IoUtils.readBounded(inputStream, maxBytes = 100)

        assertArrayEquals(sampleData, result)
    }

    @Test
    fun testReadBoundedExceedingLimit() {
        val largeData = ByteArray(100) { 1 }
        val inputStream = ByteArrayInputStream(largeData)
        val result = IoUtils.readBounded(inputStream, maxBytes = 50)

        assertNull(result)
    }
}
