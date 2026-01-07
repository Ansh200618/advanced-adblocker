package com.adblocker.app

import android.content.Intent
import android.os.Bundle
import android.view.Menu
import android.view.MenuItem
import android.webkit.*
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.google.android.material.floatingactionbutton.FloatingActionButton
import java.io.ByteArrayInputStream

class MainActivity : AppCompatActivity() {
    
    private lateinit var webView: WebView
    private lateinit var filterManager: FilterManager
    private lateinit var statsManager: StatsManager
    private var adBlockingEnabled = true
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        // Initialize managers
        filterManager = FilterManager(this)
        statsManager = StatsManager(this)
        
        // Setup toolbar
        setSupportActionBar(findViewById(R.id.toolbar))
        
        // Setup WebView
        setupWebView()
        
        // Setup FAB
        findViewById<FloatingActionButton>(R.id.fab_stats).setOnClickListener {
            showStats()
        }
        
        // Load homepage
        webView.loadUrl("https://www.google.com")
    }
    
    private fun setupWebView() {
        webView = findViewById(R.id.webView)
        
        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            setSupportZoom(true)
            builtInZoomControls = true
            displayZoomControls = false
            loadWithOverviewMode = true
            useWideViewPort = true
        }
        
        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                return false
            }
            
            override fun shouldInterceptRequest(
                view: WebView?,
                request: WebResourceRequest?
            ): WebResourceResponse? {
                if (!adBlockingEnabled) {
                    return super.shouldInterceptRequest(view, request)
                }
                
                request?.url?.toString()?.let { url ->
                    if (filterManager.shouldBlock(url)) {
                        statsManager.incrementBlocked()
                        updateBadge()
                        return WebResourceResponse(
                            "text/plain",
                            "utf-8",
                            ByteArrayInputStream("".toByteArray())
                        )
                    }
                }
                return super.shouldInterceptRequest(view, request)
            }
        }
        
        webView.webChromeClient = object : WebChromeClient() {
            override fun onProgressChanged(view: WebView?, newProgress: Int) {
                supportActionBar?.title = if (newProgress == 100) {
                    view?.title ?: getString(R.string.app_name)
                } else {
                    "Loading... $newProgress%"
                }
            }
        }
    }
    
    private fun updateBadge() {
        // Update badge/notification with blocked count
        val count = statsManager.getTotalBlocked()
        supportActionBar?.subtitle = "$count blocked"
    }
    
    private fun showStats() {
        val stats = statsManager.getStats()
        val message = """
            Total Blocked: ${stats.totalBlocked}
            Ads Blocked: ${stats.adsBlocked}
            Trackers Blocked: ${stats.trackersBlocked}
        """.trimIndent()
        Toast.makeText(this, message, Toast.LENGTH_LONG).show()
    }
    
    override fun onCreateOptionsMenu(menu: Menu?): Boolean {
        menuInflater.inflate(R.menu.main_menu, menu)
        return true
    }
    
    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        return when (item.itemId) {
            R.id.action_settings -> {
                startActivity(Intent(this, SettingsActivity::class.java))
                true
            }
            R.id.action_filters -> {
                startActivity(Intent(this, FilterActivity::class.java))
                true
            }
            R.id.action_toggle_blocking -> {
                adBlockingEnabled = !adBlockingEnabled
                item.isChecked = adBlockingEnabled
                Toast.makeText(
                    this,
                    if (adBlockingEnabled) "Ad blocking enabled" else "Ad blocking disabled",
                    Toast.LENGTH_SHORT
                ).show()
                true
            }
            else -> super.onOptionsItemSelected(item)
        }
    }
    
    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }
}
