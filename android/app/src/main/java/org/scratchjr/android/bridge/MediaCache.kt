package org.scratchjr.android.bridge

import java.util.concurrent.ConcurrentHashMap

object MediaCache {
    private val cache = ConcurrentHashMap<String, String>()

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
