package com.adblocker.app

import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

class FilterActivity : AppCompatActivity() {

    private lateinit var filterEditText: EditText
    private lateinit var applyButton: Button
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_filter)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        
        filterEditText = findViewById(R.id.filter_edit_text)
        applyButton = findViewById(R.id.apply_filters_button)
        
        applyButton.setOnClickListener {
            val filters = filterEditText.text.toString()
            // Save custom filters
            saveCustomFilters(filters)
            Toast.makeText(this, "Custom filters applied", Toast.LENGTH_SHORT).show()
        }
        
        // Load existing custom filters
        loadCustomFilters()
    }
    
    private fun saveCustomFilters(filters: String) {
        val prefs = getSharedPreferences("CustomFilters", MODE_PRIVATE)
        prefs.edit().putString("filters", filters).apply()
    }
    
    private fun loadCustomFilters() {
        val prefs = getSharedPreferences("CustomFilters", MODE_PRIVATE)
        val filters = prefs.getString("filters", "")
        filterEditText.setText(filters)
    }
}
