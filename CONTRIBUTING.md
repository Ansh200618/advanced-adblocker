# Contributing to Advanced Ad Blocker

Thank you for your interest in contributing to Advanced Ad Blocker! This document provides guidelines and information for contributors.

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help create a welcoming environment for everyone

## How to Contribute

### Reporting Bugs

If you find a bug, please open an issue with:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Browser version and extension version
- Screenshots if applicable

### Suggesting Features

Feature suggestions are welcome! Please:
- Check existing issues first to avoid duplicates
- Explain the use case and benefits
- Describe how the feature would work
- Consider privacy and performance implications

### Submitting Pull Requests

1. **Fork the repository**
   ```bash
   git clone https://github.com/Ansh200618/advanced-adblocker.git
   cd advanced-adblocker
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow the coding style (see below)
   - Test your changes thoroughly
   - Update documentation if needed

4. **Verify your changes**
   ```bash
   npm run verify
   ```

5. **Commit your changes**
   ```bash
   git add .
   git commit -m "Add feature: description"
   ```

6. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```
   Then open a Pull Request on GitHub

## Development Setup

### Prerequisites

- Node.js (v14 or higher)
- A Chromium-based browser or Firefox
- Git

### Getting Started

```bash
# Clone the repository
git clone https://github.com/Ansh200618/advanced-adblocker.git
cd advanced-adblocker

# Install dependencies (optional, for linting)
npm install

# Verify the extension
npm run verify

# Build for testing
npm run build:chrome
```

### Loading for Development

**Chrome/Edge/Brave:**
1. Open `chrome://extensions/`
2. Enable Developer mode
3. Click "Load unpacked"
4. Select the repository folder

**Firefox:**
1. Open `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select `manifest.json`

## Coding Guidelines

### JavaScript Style

- Use modern ES6+ syntax
- Use `const` and `let`, avoid `var`
- Use async/await for asynchronous operations
- Add comments for complex logic
- Follow existing code structure

Example:
```javascript
async function loadData() {
  try {
    const data = await chrome.storage.local.get(['stats']);
    // Process data
  } catch (error) {
    console.error('Error loading data:', error);
  }
}
```

### HTML/CSS Style

- Use semantic HTML
- Keep CSS modular and organized
- Use consistent naming conventions
- Mobile-friendly design considerations

### File Organization

```
advanced-adblocker/
├── src/
│   ├── background/      # Background service worker
│   ├── content/         # Content scripts
│   ├── popup/          # Popup UI
│   └── options/        # Settings page
├── assets/             # Icons and images
├── filters/            # Filter rule files
├── manifest.json       # Extension manifest
└── README.md          # Documentation
```

## Testing

### Manual Testing Checklist

Before submitting a PR, test:

- [ ] Extension loads without errors
- [ ] Popup opens and displays correctly
- [ ] Statistics update properly
- [ ] Whitelist functionality works
- [ ] Element picker works
- [ ] Settings save and load correctly
- [ ] Ad blocking works on test sites
- [ ] No console errors
- [ ] Performance is acceptable

### Test Sites

Use these to verify ad blocking:
- https://simple-adblock-tester.com/
- Various news sites with ads
- Social media platforms

## Adding Filter Rules

When adding new filter rules to `filters/easylist.json` or `filters/easyprivacy.json`:

1. Follow the declarativeNetRequest rule format
2. Use unique IDs (check existing rules)
3. Set appropriate priority
4. Test the rule thoroughly
5. Document complex patterns

Example rule:
```json
{
  "id": 11,
  "priority": 1,
  "action": {
    "type": "block"
  },
  "condition": {
    "urlFilter": "*://example-ad-domain.com/*",
    "resourceTypes": ["script", "image"]
  }
}
```

## Documentation

Update documentation when:
- Adding new features
- Changing existing behavior
- Fixing bugs that affect usage
- Adding new configuration options

Documentation files:
- `README.md` - Main documentation
- `QUICKSTART.md` - Quick start guide
- `CONTRIBUTING.md` - This file
- Code comments for complex logic

## Release Process

For maintainers:

1. Update version in `manifest.json` and `package.json`
2. Update CHANGELOG (if exists)
3. Run full verification: `npm run verify`
4. Build packages: `npm run package`
5. Test both Chrome and Firefox builds
6. Create GitHub release with build artifacts
7. Tag the release: `git tag v1.x.x`

## Privacy Considerations

When contributing, ensure:
- No data collection without explicit user consent
- No external network requests except necessary browser APIs
- All settings stored locally
- Respect user privacy at all times

## Performance Guidelines

- Minimize memory usage
- Avoid blocking the main thread
- Use efficient algorithms
- Test with many tabs open
- Profile if adding complex features

## Questions?

- Open an issue for general questions
- Check existing documentation
- Review closed issues for similar questions

## License

By contributing, you agree that your contributions will be licensed under the GPL-3.0 License.

---

Thank you for contributing to make the web a better place! 🎉
