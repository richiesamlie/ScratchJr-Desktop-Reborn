package org.scratchjr.android.bridge

import java.util.Collections
import java.util.LinkedHashMap

object MediaCache {
    private const val MAX_ENTRIES = 50

    private val cache = Collections.synchronizedMap(
        object : LinkedHashMap<String, String>(MAX_ENTRIES, 0.75f, true) {
            override fun removeEldestEntry(eldest: MutableMap.MutableEntry<String, String>?): Boolean {
                return size > MAX_ENTRIES
            }
        }
    )

    fun put(key: String, data: String) {
        cache[key] = data
    }

    fun get(key: String): String? {
        return cache[key]
    }

    fun remove(key: String) {
        cache.remove(key)
    }

    fun clear() {
        cache.clear()
    }
}
