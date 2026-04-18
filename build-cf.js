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

    // THE PERFECT OPENNEXT CLOUDFLARE FIX: 
    // Move the worker.js directly into the assets folder as _worker.js, 
    // because Cloudflare Pages uses that folder as the root deployment directory.
    const workerPath = '.open-next/worker.js';
    const finalPath = '.open-next/assets/_worker.js';
    
    if (fs.existsSync(workerPath)) {
        if (!fs.existsSync('.open-next/assets')) {
            fs.mkdirSync('.open-next/assets', { recursive: true });
        }
        console.log('\n🔧 Injecting worker.js -> assets/_worker.js...');
        fs.renameSync(workerPath, finalPath);
        console.log('\n✅ Successfully married the Function with the Static Assets inside /assets');
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
