# Quick Start Guide

## Installation (3 Easy Steps!)

### For Chrome, Edge, Brave, or other Chromium-based browsers:

1. **Download the Extension**
   - Clone or download this repository
   - Or download from the Releases page

2. **Open Extensions Page**
   - Navigate to `chrome://extensions/` (or `edge://extensions/`, `brave://extensions/`)
   - Enable "Developer mode" using the toggle in the top-right corner

3. **Load the Extension**
   - Click "Load unpacked"
   - Select the `advanced-adblocker` folder
   - Done! The extension icon will appear in your toolbar

### For Firefox:

1. **Download the Extension**
   - Clone or download this repository

2. **Open Debugging Page**
   - Navigate to `about:debugging#/runtime/this-firefox`

3. **Load Temporary Add-on**
   - Click "Load Temporary Add-on"
   - Navigate to the extension folder
   - Select `manifest.json`
   - Note: This will be temporary until browser restart (for permanent installation, the extension needs to be signed)

## First Time Setup

No setup required! The extension works immediately after installation with sensible defaults:
- ✅ Ad blocking enabled
- ✅ Tracker blocking enabled
- ✅ Cosmetic filtering enabled
- ✅ Statistics tracking enabled

## Basic Usage

### View Statistics
- Click the extension icon in your toolbar
- See real-time counts of blocked ads, trackers, and scripts

### Toggle Protection
- Click the extension icon
- Use the toggle switch to enable/disable blocking

### Whitelist a Site
- Visit the site you want to whitelist
- Click the extension icon
- Click "Whitelist This Site"

### Block a Specific Element
- Click the extension icon
- Click "Block Element"
- Hover over the element you want to block (it will be highlighted)
- Click the element
- The element will be permanently blocked

### Access Settings
- Click the extension icon
- Click "Settings"
- Or right-click the extension icon and select "Options"

## Settings Overview

### General
- Toggle ad blocking on/off
- Enable/disable tracker blocking
- Control cosmetic filtering
- Configure badge display

### Filter Lists
- View enabled filter lists
- Core lists (EasyList, EasyPrivacy) are always active

### Whitelist
- Add domains to whitelist
- Remove whitelisted domains
- Format: `example.com` (no http:// or www needed)

### Custom Filters
- Add your own blocking rules
- Examples:
  - `||ads.example.com^` - Block a domain
  - `example.com/ads/` - Block a specific path
  - `*.ads.*` - Use wildcards

## Keyboard Shortcuts

- `ESC` - Cancel element picker mode

## Tips & Tricks

1. **Element Picker**: Use the element picker to block annoying page elements like cookie banners, newsletter popups, etc.

2. **Statistics Badge**: The extension icon shows the total number of items blocked on the current page

3. **Whitelist Specific Sites**: If a site doesn't work properly, try whitelisting it

4. **Custom Filters**: Advanced users can add custom filter rules for fine-grained control

5. **Reset Statistics**: You can reset all statistics from the Settings page

## Troubleshooting

### Site Not Loading Properly
1. Check if the site is critical (banking, payment, etc.)
2. Click the extension icon
3. Click "Whitelist This Site"
4. Refresh the page

### Element Still Showing
1. Try using the Element Picker
2. Add a custom filter rule
3. Check if cosmetic filtering is enabled in Settings

### Statistics Not Updating
1. Refresh the extension popup
2. Reload the page you're visiting
3. Check if ad blocking is enabled

### Extension Not Working
1. Check if Developer mode is still enabled
2. Refresh the extension in chrome://extensions/
3. Reload the webpage

## Getting Help

- Check the main [README.md](README.md) for detailed documentation
- Submit issues on [GitHub](https://github.com/Ansh200618/advanced-adblocker/issues)
- Make sure you're using a supported browser

## Privacy

- No data collection
- Everything stays on your device
- No external server connections
- Open source and auditable

---

**Enjoy an ad-free browsing experience! 🎉**
