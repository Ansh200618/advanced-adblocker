#!/usr/bin/env node

/**
 * Extension Verification Script
 * Checks that all required files and components are present and valid
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Advanced Ad Blocker Extension...\n');

let errors = 0;
let warnings = 0;
let checks = 0;

function check(condition, message, isWarning = false) {
  checks++;
  if (condition) {
    console.log(`✓ ${message}`);
    return true;
  } else {
    if (isWarning) {
      console.log(`⚠ ${message}`);
      warnings++;
    } else {
      console.log(`✗ ${message}`);
      errors++;
    }
    return false;
  }
}

// Check manifest.json
console.log('Checking manifest.json...');
try {
  const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
  check(manifest.manifest_version === 3, 'Manifest version is 3');
  check(manifest.name === 'Advanced Ad Blocker', 'Extension name is correct');
  check(manifest.version, `Version: ${manifest.version}`);
  check(manifest.permissions && manifest.permissions.length > 0, 'Permissions defined');
  check(manifest.declarative_net_request, 'Declarative Net Request configured');
  check(manifest.background && manifest.background.service_worker, 'Background service worker defined');
  check(manifest.action && manifest.action.default_popup, 'Popup defined');
  check(manifest.options_page, 'Options page defined');
} catch (e) {
  check(false, `manifest.json is valid JSON: ${e.message}`);
}

// Check required directories
console.log('\nChecking directory structure...');
check(fs.existsSync('src'), 'src/ directory exists');
check(fs.existsSync('src/background'), 'src/background/ directory exists');
check(fs.existsSync('src/content'), 'src/content/ directory exists');
check(fs.existsSync('src/popup'), 'src/popup/ directory exists');
check(fs.existsSync('src/options'), 'src/options/ directory exists');
check(fs.existsSync('assets'), 'assets/ directory exists');
check(fs.existsSync('assets/icons'), 'assets/icons/ directory exists');
check(fs.existsSync('filters'), 'filters/ directory exists');

// Check required files
console.log('\nChecking required files...');
const requiredFiles = [
  'src/background/background.js',
  'src/content/content.js',
  'src/content/content.css',
  'src/content/picker.html',
  'src/popup/popup.html',
  'src/popup/popup.js',
  'src/popup/popup.css',
  'src/options/options.html',
  'src/options/options.js',
  'src/options/options.css',
  'assets/icons/icon16.png',
  'assets/icons/icon48.png',
  'assets/icons/icon128.png',
  'filters/easylist.json',
  'filters/easyprivacy.json',
  'filters/custom.json',
  'README.md',
  'LICENSE',
  'package.json'
];

requiredFiles.forEach(file => {
  check(fs.existsSync(file), `${file} exists`);
});

// Check filter files
console.log('\nChecking filter files...');
try {
  const easylist = JSON.parse(fs.readFileSync('filters/easylist.json', 'utf8'));
  check(Array.isArray(easylist), 'easylist.json is an array');
  check(easylist.length > 0, `easylist.json has ${easylist.length} rules`);
} catch (e) {
  check(false, `easylist.json is valid: ${e.message}`);
}

try {
  const easyprivacy = JSON.parse(fs.readFileSync('filters/easyprivacy.json', 'utf8'));
  check(Array.isArray(easyprivacy), 'easyprivacy.json is an array');
  check(easyprivacy.length > 0, `easyprivacy.json has ${easyprivacy.length} rules`);
} catch (e) {
  check(false, `easyprivacy.json is valid: ${e.message}`);
}

try {
  const custom = JSON.parse(fs.readFileSync('filters/custom.json', 'utf8'));
  check(Array.isArray(custom), 'custom.json is an array');
} catch (e) {
  check(false, `custom.json is valid: ${e.message}`);
}

// Check JavaScript files for basic syntax
console.log('\nChecking JavaScript syntax...');
const { execSync } = require('child_process');
const jsFiles = [
  'src/background/background.js',
  'src/content/content.js',
  'src/popup/popup.js',
  'src/options/options.js'
];

jsFiles.forEach(file => {
  try {
    execSync(`node -c ${file}`, { stdio: 'pipe' });
    check(true, `${file} syntax is valid`);
  } catch (e) {
    check(false, `${file} syntax is valid`);
  }
});

// Check HTML files
console.log('\nChecking HTML files...');
const htmlFiles = [
  'src/popup/popup.html',
  'src/options/options.html',
  'src/content/picker.html'
];

htmlFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  check(content.includes('<!DOCTYPE html>'), `${file} has DOCTYPE`);
  check(content.includes('</html>'), `${file} is complete`);
});

// Check CSS files
console.log('\nChecking CSS files...');
const cssFiles = [
  'src/popup/popup.css',
  'src/options/options.css',
  'src/content/content.css'
];

cssFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  check(content.length > 0, `${file} is not empty`);
});

// Check icon files
console.log('\nChecking icon files...');
const iconSizes = [16, 48, 128];
iconSizes.forEach(size => {
  const file = `assets/icons/icon${size}.png`;
  if (fs.existsSync(file)) {
    const stats = fs.statSync(file);
    check(stats.size > 0, `${file} exists (${stats.size} bytes)`);
  } else {
    check(false, `${file} exists`);
  }
});

// Summary
console.log('\n' + '='.repeat(60));
console.log('VERIFICATION SUMMARY');
console.log('='.repeat(60));
console.log(`Total checks: ${checks}`);
console.log(`✓ Passed: ${checks - errors - warnings}`);
console.log(`✗ Failed: ${errors}`);
console.log(`⚠ Warnings: ${warnings}`);

if (errors === 0 && warnings === 0) {
  console.log('\n🎉 All checks passed! The extension is ready to use.');
  console.log('\nTo load the extension:');
  console.log('1. Open chrome://extensions/');
  console.log('2. Enable Developer mode');
  console.log('3. Click "Load unpacked"');
  console.log('4. Select this directory');
  process.exit(0);
} else if (errors === 0) {
  console.log('\n⚠️  All critical checks passed with some warnings.');
  process.exit(0);
} else {
  console.log('\n❌ Some checks failed. Please fix the errors above.');
  process.exit(1);
}
