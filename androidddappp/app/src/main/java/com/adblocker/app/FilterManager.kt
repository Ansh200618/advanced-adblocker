package com.adblocker.app

import android.content.Context
import java.io.BufferedReader
import java.io.InputStreamReader

class FilterManager(private val context: Context) {
    
    private val blockList = mutableSetOf<String>()
    
    init {
        loadFilters()
    }
    
    private fun loadFilters() {
        // Load all filter files from assets
        val filterFiles = listOf(
            "filters/easylist.txt",
            "filters/easyprivacy.txt",
            "filters/annoyances.txt",
            "filters/social.txt",
            "filters/security.txt"
        )
        
        filterFiles.forEach { fileName ->
            try {
                context.assets.open(fileName).use { inputStream ->
                    BufferedReader(InputStreamReader(inputStream)).use { reader ->
                        reader.forEachLine { line ->
                            val trimmed = line.trim()
                            if (trimmed.isNotEmpty() && !trimmed.startsWith("!")) {
                                processFilterRule(trimmed)
                            }
                        }
                    }
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }
    
    private fun processFilterRule(rule: String) {
        // Convert filter rule to domain pattern
        var pattern = rule
        
        // Remove || prefix (start anchor)
        if (pattern.startsWith("||")) {
            pattern = pattern.substring(2)
        }
        
        // Remove ^ suffix (separator)
        if (pattern.endsWith("^")) {
            pattern = pattern.substring(0, pattern.length - 1)
        }
        
        // Remove $ options
        val dollarIndex = pattern.indexOf('$')
        if (dollarIndex != -1) {
            pattern = pattern.substring(0, dollarIndex)
        }
        
        // Add to block list
        if (pattern.isNotEmpty()) {
            blockList.add(pattern.lowercase())
        }
    }
    
    fun shouldBlock(url: String): Boolean {
        val lowerUrl = url.lowercase()
        
        // Check if URL matches any filter
        return blockList.any { pattern ->
            lowerUrl.contains(pattern)
        }
    }
    
    fun getFilterCount(): Int = blockList.size
}
