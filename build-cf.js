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

    // THE ULTIMATE OPENNEXT & CLOUDFLARE FIX:
    // Move all server code and the worker directly into the static `assets` cluster.
    // This solves all relative dependency pathing issues while guaranteeing Cloudflare 
    // deploys the `_next` CSS files correctly to the root of KV without ignoring them.
    const workerPath = '.open-next/worker.js';
    const assetsDir = '.open-next/assets';

    if (fs.existsSync(workerPath)) {
        console.log('\n🔧 Migrating OpenNext Server Bundle into assets/');
        
        // Ensure assets directory exists
        if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });

        // List of core OpenNext server folders to migrate
        const serverFolders = ['cloudflare', 'server-functions', '.build', 'middleware', 'cache'];
        
        for (const folder of serverFolders) {
            const src = `.open-next/${folder}`;
            const dest = `${assetsDir}/${folder}`;
            if (fs.existsSync(src)) {
                fs.cpSync(src, dest, { recursive: true });
                console.log(`✅ Migrated /${folder}`);
            }
        }

        // Migrate and rename the worker precisely
        fs.renameSync(workerPath, `${assetsDir}/_worker.js`);
        
        // Migrate routes and force Cloudflare to preserve hidden CSS folders
        if (fs.existsSync('.open-next/_routes.json')) {
            fs.renameSync('.open-next/_routes.json', `${assetsDir}/_routes.json`);
        }
        fs.writeFileSync(`${assetsDir}/.nojekyll`, '');

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
