#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const platform = process.argv[2] || 'chrome'; // chrome or firefox

console.log(`Building extension for ${platform}...`);

// Create build directory
const buildDir = path.join(__dirname, 'build', platform);
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

// Files and directories to copy
const filesToCopy = [
  'manifest.json',
  'src',
  'assets',
  'filters',
  'LICENSE',
  'README.md'
];

// Copy files
console.log('Copying files...');
filesToCopy.forEach(file => {
  const src = path.join(__dirname, file);
  const dest = path.join(buildDir, file);
  
  if (fs.existsSync(src)) {
    if (fs.statSync(src).isDirectory()) {
      copyDirectory(src, dest);
    } else {
      fs.copyFileSync(src, dest);
    }
    console.log(`  ✓ Copied ${file}`);
  }
});

// Modify manifest for Firefox if needed
if (platform === 'firefox') {
  console.log('Adapting manifest for Firefox...');
  const manifestPath = path.join(buildDir, 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  
  // Firefox-specific modifications
  manifest.browser_specific_settings = {
    gecko: {
      id: 'advanced-adblocker@example.com',
      strict_min_version: '109.0'
    }
  };
  
  // Use background scripts instead of service worker for Firefox
  if (manifest.background && manifest.background.service_worker) {
    manifest.background = {
      scripts: [manifest.background.service_worker]
    };
  }
  
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log('  ✓ Manifest adapted for Firefox');
}

console.log(`\n✓ Build complete! Output: ${buildDir}`);
console.log(`\nTo load the extension:`);
if (platform === 'chrome') {
  console.log('1. Open chrome://extensions/');
  console.log('2. Enable "Developer mode"');
  console.log('3. Click "Load unpacked"');
  console.log(`4. Select the folder: ${buildDir}`);
} else {
  console.log('1. Open about:debugging#/runtime/this-firefox');
  console.log('2. Click "Load Temporary Add-on"');
  console.log(`3. Select manifest.json from: ${buildDir}`);
}

// Helper function to copy directory recursively
function copyDirectory(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}
