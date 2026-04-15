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

// 1. Run the OpenNext build
console.log('--- Starting Cloudflare Build ---');
runCommand('npx @opennextjs/cloudflare');

// 2. Clean up caches to avoid 25MB limit
console.log('\n--- Cleaning up build artifacts ---');

const pathsToClean = [
    '.next/cache',
    '.worker-next/.next/cache',
    '.worker-next/cache'
];

pathsToClean.forEach(p => {
    const fullPath = path.resolve(p);
    removeDirRecursive(fullPath);
});

console.log('\n✅ Build and cleanup complete! Ready for deployment.');
