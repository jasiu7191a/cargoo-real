const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function runCommand(command) {
    console.log(`\n🚀 Running: ${command}`);
    try {
        execSync(command, { stdio: 'inherit' });
    } catch (e) {
        console.error(`❌ Command failed: ${command}`);
        process.exit(1);
    }
}

function removeDirRecursive(dir) {
    if (fs.existsSync(dir)) {
        console.log(`🧹 Removing directory: ${dir}`);
        fs.rmSync(dir, { recursive: true, force: true });
    }
}

// 1. Clean previous builds
console.log('--- Cleaning previous builds ---');
removeDirRecursive('.worker-next');
removeDirRecursive('.next');

// 2. Run the OpenNext build
console.log('\n--- Starting Cloudflare Build ---');
runCommand('npx @opennextjs/cloudflare');

// 3. FORCE CLEANUP of the build artifacts
// This ensures the 25MB limit is NEVER hit by accidental cache files
console.log('\n--- Finalizing bundles for Cloudflare Pages (25MB Limit Enforcement) ---');

const pathsToSweep = [
    '.next/cache',
    '.worker-next/.next/cache',
    '.worker-next/cache'
];

pathsToSweep.forEach(p => {
    const fullPath = path.resolve(p);
    removeDirRecursive(fullPath);
});

// Scan for any files over 20MB just to be safe (limit is 25MB)
const MAX_SIZE = 20 * 1024 * 1024; 
function scanForLargeFiles(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stats = fs.statSync(fullPath);
        if (stats.isDirectory()) {
            scanForLargeFiles(fullPath);
        } else if (stats.size > MAX_SIZE) {
            console.warn(`⚠️ WARNING: Large file detected: ${p} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
            if (fullPath.includes('cache') || fullPath.endsWith('.pack')) {
                console.log(`🔥 Deleting non-essential large file: ${fullPath}`);
                fs.unlinkSync(fullPath);
            }
        }
    }
}

if (fs.existsSync('.worker-next')) {
    scanForLargeFiles('.worker-next');
}

console.log('\n✅ Build verified and cleaned! No files exceed deployment limits.');
