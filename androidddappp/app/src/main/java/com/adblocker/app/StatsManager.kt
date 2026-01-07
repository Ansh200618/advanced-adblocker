package com.adblocker.app

import android.content.Context
import android.content.SharedPreferences

data class AdBlockStats(
    val totalBlocked: Int = 0,
    val adsBlocked: Int = 0,
    val trackersBlocked: Int = 0
)

class StatsManager(context: Context) {
    
    private val prefs: SharedPreferences = context.getSharedPreferences(
        "AdBlockerStats",
        Context.MODE_PRIVATE
    )
    
    fun incrementBlocked() {
        val current = getTotalBlocked()
        prefs.edit().putInt("total_blocked", current + 1).apply()
    }
    
    fun getTotalBlocked(): Int {
        return prefs.getInt("total_blocked", 0)
    }
    
    fun getStats(): AdBlockStats {
        return AdBlockStats(
            totalBlocked = prefs.getInt("total_blocked", 0),
            adsBlocked = prefs.getInt("ads_blocked", 0),
            trackersBlocked = prefs.getInt("trackers_blocked", 0)
        )
    }
    
    fun resetStats() {
        prefs.edit().clear().apply()
    }
}
