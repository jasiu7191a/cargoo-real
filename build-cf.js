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
             fs.cpSync(`${srcDir}/${item}`, `.open-next/${item}`, { recursive: true });
        }
    }

    // MANDATORY CLOUDFLARE BYPASS: 
    // If the Cloudflare dashboard is NOT set to the "Next.js" framework preset, 
    // it will ruthlessly delete the `_next` folder during upload. 
    // `.nojekyll` forces Cloudflare to ingest all underscore files safely!
    fs.writeFileSync('.open-next/.nojekyll', '');

    // 2. Rename worker.js to _worker.js so Cloudflare Pages recognizes it
    if (fs.existsSync('.open-next/worker.js')) {
        fs.renameSync('.open-next/worker.js', '.open-next/_worker.js');
        console.log('\n🚀 Master Worker migrated to _worker.js successfully.');
    } else {
        console.warn('\n⚠️ Warning: worker.js not found in .open-next/');
    }

    console.log('\n✨ Success: OpenNext build finished! Wrangler will now automatically bundle and deploy your full-stack app.');
  } catch (error) {
    console.error('\n❌ Build failed:');
    console.error(error.message);
    process.exit(1);
  }
}

runBuild();
