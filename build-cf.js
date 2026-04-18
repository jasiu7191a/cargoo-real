const { execSync } = require('child_process');
const fs = require('fs');

async function runBuild() {
  try {
    console.log('\n--- Cleaning previous builds ---');
    if (fs.existsSync('.open-next')) {
        fs.rmSync('.open-next', { recursive: true, force: true });
    }

    console.log('\n--- Starting Cloudflare Build ---');
    
    console.log('\n🚀 Running: npx @opennextjs/cloudflare build');
    execSync('npx @opennextjs/cloudflare build --dangerouslyUseUnsupportedNextVersion', { stdio: 'inherit' });

    // ASSETS FIX: Cloudflare needs static files at the root, not inside /assets
    const assetsDir = '.open-next/assets';
    if (fs.existsSync(assetsDir)) {
        console.log('\n📦 Moving static assets and CSS to root...');
        const items = fs.readdirSync(assetsDir);
        for (const item of items) {
            fs.cpSync(`${assetsDir}/${item}`, `.open-next/${item}`, { recursive: true });
        }
        console.log('✅ Found and moved static assets successfully.');
    }

    // THE MASTER FIX: Rename worker.js to _worker.js for Cloudflare Pages compatibility
    const workerPath = '.open-next/worker.js';
    const finalPath = '.open-next/_worker.js';
    if (fs.existsSync(workerPath)) {
        console.log('\n🔧 Renaming worker.js -> _worker.js...');
        fs.renameSync(workerPath, finalPath);
        console.log('\n✅ Successfully renamed to _worker.js');
    } else {
        console.warn('\n⚠️ Warning: worker.js not found in .open-next/');
    }

    console.log('\n✨ Success: Build finished! Cloudflare will now recognize your Functions and perfectly serve your Tailwind Styles.');
  } catch (error) {
    console.error('\n❌ Build failed:');
    console.error(error.message);
    process.exit(1);
  }
}

runBuild();
