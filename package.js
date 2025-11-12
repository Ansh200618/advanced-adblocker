#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Creating distribution packages...');

// Read package.json for version
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const version = packageJson.version;

// Create dist directory
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Build for both platforms
const platforms = ['chrome', 'firefox'];

platforms.forEach(platform => {
  console.log(`\nBuilding ${platform} version...`);
  
  try {
    execSync(`node build.js ${platform}`, { stdio: 'inherit' });
    
    const buildDir = path.join(__dirname, 'build', platform);
    const zipName = `advanced-adblocker-${platform}-v${version}.zip`;
    const zipPath = path.join(distDir, zipName);
    
    console.log(`Creating ${zipName}...`);
    
    // Create zip file
    const archiver = require('archiver');
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    output.on('close', () => {
      console.log(`  ✓ Created ${zipName} (${archive.pointer()} bytes)`);
    });
    
    archive.on('error', (err) => {
      throw err;
    });
    
    archive.pipe(output);
    archive.directory(buildDir, false);
    archive.finalize();
    
  } catch (error) {
    console.error(`Error building ${platform}:`, error.message);
  }
});

console.log(`\n✓ All packages created in ${distDir}`);
console.log('\nDistribution files:');
fs.readdirSync(distDir).forEach(file => {
  const stats = fs.statSync(path.join(distDir, file));
  const sizeInMB = (stats.size / 1024 / 1024).toFixed(2);
  console.log(`  - ${file} (${sizeInMB} MB)`);
});
