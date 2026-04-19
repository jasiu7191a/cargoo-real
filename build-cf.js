const { execSync } = require('child_process');
const fs = require('fs');

async function runBuild() {
  try {
    console.log('\n--- Cleaning previous builds ---');
    if (fs.existsSync('.open-next')) {
        fs.rmSync('.open-next', { recursive: true, force: true });
    }

    console.log('\n--- Starting Cloudflare Build ---');
    
    // Core build command execution
    console.log('\n🚀 Running: npx @opennextjs/cloudflare build');
    execSync('npx @opennextjs/cloudflare build --dangerouslyUseUnsupportedNextVersion', { stdio: 'inherit' });

    // Cloudflare Pages will automatically deploy the '.open-next' folder 
    // once this script finishes successfully.
    // THE FINAL OPENNEXT & CLOUDFLARE PAGES FIX:
    // Cloudflare Pages expects the worker and static files at the absolute root of the build output.
    // OpenNext outputs static files into `.open-next/assets/`, causing 404s.
    // We must flatten `assets/` into `.open-next/` and rename the worker.
    
    // 1. Flatten static assets out of assets/ directly into .open-next/
    const srcDir = '.open-next/assets';
    if (fs.existsSync(srcDir)) {
        console.log('\n📦 Flattening Cloudflare Static Assets to root...');
        const items = fs.readdirSync(srcDir);
        for (const item of items) {
             const srcPath = `${srcDir}/${item}`;
             const destPath = `.open-next/${item}`;
             fs.cpSync(srcPath, destPath, { recursive: true });
             console.log(`   - Migrated: ${item}`);
        }
        // Cleanup source assets folder to ensure Cloudflare doesn't get confused
        fs.rmSync(srcDir, { recursive: true, force: true });
        console.log('🗑️ Cleaned up intermediate assets folder.');
    }

    // MANDATORY CLOUDFLARE BYPASS: 
    // If the Cloudflare dashboard is NOT set to the "Next.js" framework preset, 
    // it will ruthlessly delete the `_next` folder during upload. 
    // `.nojekyll` forces Cloudflare to ingest all underscore files safely!
    fs.writeFileSync('.open-next/.nojekyll', '');

    // 2. Rename worker.js to _worker.js so Cloudflare Pages recognizes it
    const workerPath = '.open-next/worker.js';
    const finalWorkerPath = '.open-next/_worker.js';
    if (fs.existsSync(workerPath)) {
        fs.renameSync(workerPath, finalWorkerPath);
        console.log('\n🚀 Master Worker migrated to _worker.js successfully.');
    } else if (!fs.existsSync(finalWorkerPath)) {
        console.warn('\n⚠️ Warning: worker.js not found in .open-next/');
    }

    console.log('\n✨ Success: OpenNext build finished! Cloudflare will now deploy your full-stack app.');
  } catch (error) {
    console.error('\n❌ Build failed:');
    console.error(error.message);
    process.exit(1);
  }
}

runBuild();
