# Advanced Ad Blocker

A comprehensive browser extension for blocking ads, trackers, and unwanted content. Built with modern web technologies and designed to provide a fast, private, and clean browsing experience.

![License](https://img.shields.io/badge/license-GPL--3.0-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)

## ✨ Features

- **🛡️ Comprehensive Ad Blocking**: Block ads across all websites with advanced filtering
- **🔒 Privacy Protection**: Prevent tracking scripts and analytics from monitoring your activity
- **🎨 Cosmetic Filtering**: Hide ad placeholders and clean up page layouts
- **🎯 Element Picker**: Point-and-click tool to block specific page elements
- **📊 Statistics Dashboard**: Track how many ads and trackers have been blocked
- **⚙️ Custom Filters**: Add your own blocking rules with flexible syntax
- **✅ Whitelist Management**: Easily disable blocking on trusted sites
- **🚀 Performance**: Lightweight and optimized for minimal resource usage
- **🔐 Privacy First**: No data collection - everything stays on your device

## 📥 Installation

### Quick Installation (Download and Use)

1. **Download the Extension**:
   - Download the latest release from the [Releases page](https://github.com/Ansh200618/advanced-adblocker/releases)
   - Or clone this repository:
     ```bash
     git clone https://github.com/Ansh200618/advanced-adblocker.git
     cd advanced-adblocker
     ```

2. **Install in Chrome/Edge/Brave**:
   - Open your browser and navigate to:
     - Chrome: `chrome://extensions/`
     - Edge: `edge://extensions/`
     - Brave: `brave://extensions/`
   - Enable **Developer mode** (toggle in the top-right corner)
   - Click **Load unpacked**
   - Select the `advanced-adblocker` directory
   - The extension icon should appear in your toolbar! 🎉

3. **Install in Firefox**:
   - Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
   - Click **Load Temporary Add-on**
   - Navigate to the extension folder and select `manifest.json`
   - Note: For permanent installation in Firefox, the extension needs to be signed

### Building from Source

If you want to build the extension yourself:

```bash
# Install dependencies
npm install

# Build for Chrome
npm run build:chrome

# Build for Firefox
npm run build:firefox

# Build both and create distribution packages
npm run package
```

## 🚀 Usage Guide

### Getting Started

1. **After Installation**: The extension starts working immediately, blocking ads and trackers across all websites
2. **Extension Icon**: Click the icon in your toolbar to see statistics and quick actions
3. **Toggle Protection**: Use the toggle switch in the popup to enable/disable ad blocking

### Popup Interface

The popup provides quick access to:
- **Statistics**: View real-time blocking counts
  - Ads Blocked
  - Trackers Blocked
  - Scripts Blocked
  - Total Blocked
- **Quick Actions**:
  - Whitelist/unwhitelist current site
  - Open element picker
  - Access settings
- **Status Indicator**: Shows if protection is active

### Element Picker

Block specific elements on any webpage:
1. Click the **Block Element** button in the popup
2. Hover over page elements (they'll be highlighted)
3. Click on the element you want to block
4. The element will be permanently blocked on that site

### Settings Page

Access comprehensive settings by clicking the **Settings** button:

#### General Tab
- Enable/disable ad blocking
- Toggle tracker blocking
- Control cosmetic filtering
- Configure badge display

#### Filter Lists Tab
- View enabled filter lists
- EasyList (primary ad blocking)
- EasyPrivacy (tracker blocking)
- Custom rules

#### Whitelist Tab
- Add domains to whitelist
- Remove whitelisted domains
- Sites on whitelist won't have ads/trackers blocked

#### Custom Filters Tab
- Add custom blocking rules
- Syntax examples:
  - `||domain.com^` - Block domain and subdomains
  - `domain.com/path` - Block specific URL path
  - `*.ads.*` - Use wildcards

#### About Tab
- Version information
- Feature list
- Privacy policy
- License details

## 🛠️ Technical Details

### Architecture

- **Manifest V3**: Uses the latest Chrome extension manifest version
- **Declarative Net Request**: Efficient network-level blocking
- **Content Scripts**: Cosmetic filtering and element hiding
- **Service Worker**: Background processing and statistics
- **Local Storage**: All data stored locally on your device

### Filter Lists

The extension includes comprehensive blocking rules:
- **EasyList (20 rules)**: Primary filter list for blocking advertisements
  - Blocks DoubleClick, Google Ads, ad networks
  - Blocks common ad paths (/ads/, /ad.js, /advertisement)
  - Blocks ad frames and ad-related resources
- **EasyPrivacy (30 rules)**: Blocks tracking and analytics scripts
  - Google Analytics, Google Tag Manager, Facebook Pixel
  - Hotjar, Mixpanel, analytics services
  - Error tracking: Sentry, Rollbar, Bugsnag
  - Additional tracking pixels and beacons
- **Custom Rules (10 rules)**: Enhanced blocking for specific scenarios
  - Tracking pixels and beacons
  - Social media trackers (LinkedIn, Twitter)
  - Generic collect and tracking endpoints
- **Script Injection Blocking**: Content script blocks tracking globals
  - Prevents execution of ga, gtag, fbq, dataLayer
  - Blocks Sentry, Rollbar, Hotjar, Mixpanel initialization
- **Cosmetic Filtering**: 30+ CSS selectors hide ad elements
  - Common ad containers and wrappers
  - Sponsored content and social media ads
  - Tracking pixels and analytics divs

**Total Blocking Rules**: 60+ declarative rules + script-level blocking + cosmetic filters

### Permissions

The extension requires these permissions:
- `storage`: Store settings and statistics locally
- `declarativeNetRequest`: Block ads and trackers at network level
- `tabs`: Access tab information for per-site controls
- `webNavigation`: Detect page loads and updates
- `scripting`: Inject content scripts for cosmetic filtering
- `contextMenus`: Provide right-click element blocking

### Privacy

- ✅ No data collection
- ✅ No external servers
- ✅ No user tracking
- ✅ All settings stored locally
- ✅ Open source and auditable

## 📊 Statistics

The extension tracks:
- Total ads blocked
- Total trackers blocked
- Total scripts blocked
- Per-session and all-time statistics
- Can be reset anytime from settings

## 🤝 Contributing

Contributions are welcome! Here's how:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the GPL-3.0 License - see the [LICENSE](LICENSE) file for details.

## 🐛 Bug Reports & Feature Requests

Found a bug or have a feature request?
- Open an [issue](https://github.com/Ansh200618/advanced-adblocker/issues)
- Provide detailed information about the problem
- Include browser version and extension version

## 🌟 Acknowledgments

- Inspired by uBlock Origin and other ad blocking extensions
- Built with modern web extension APIs
- Community filter lists from EasyList and EasyPrivacy

## 📞 Support

Need help? 
- Check the [Issues](https://github.com/Ansh200618/advanced-adblocker/issues) page
- Read the documentation above
- Submit a new issue if your question isn't answered

---

**Made with ❤️ for a cleaner, faster, and more private web browsing experience**