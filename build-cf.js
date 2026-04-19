const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function runBuild() {
  try {
    // 1. Clean previous build
    console.log('\n--- Cleaning previous build ---');
    if (fs.existsSync('.open-next')) {
      fs.rmSync('.open-next', { recursive: true, force: true });
      console.log('✓ Cleaned .open-next');
    }

    // 2. Sync DB schema (new AdminAction table etc.)
    console.log('\n🗄️  Syncing Database Schema...');
    try {
      execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
      console.log('✓ Schema synced');
    } catch (dbErr) {
      console.warn('⚠️  Prisma DB push failed — check DATABASE_URL. Continuing...');
    }

    // 3. Run the OpenNext Cloudflare build
    console.log('\n🚀 Running: npx @opennextjs/cloudflare build');
    execSync('npx @opennextjs/cloudflare build --dangerouslyUseUnsupportedNextVersion', { stdio: 'inherit' });

    // 4. OpenNext 1.19 outputs `worker.js` but Cloudflare Pages requires `_worker.js`
    //    Rename it so Cloudflare can find the entrypoint.
    const rawWorker  = path.join('.open-next', 'worker.js');
    const finalWorker = path.join('.open-next', '_worker.js');

    if (fs.existsSync(rawWorker)) {
      fs.renameSync(rawWorker, finalWorker);
      console.log('✓ Renamed worker.js  →  _worker.js');
    } else if (fs.existsSync(finalWorker)) {
      console.log('✓ _worker.js already present (no rename needed)');
    } else {
      throw new Error(
        'Neither worker.js nor _worker.js found in .open-next/. ' +
        'The OpenNext build may have failed silently.'
      );
    }

    // 5. Ensure .nojekyll exists so Cloudflare doesn't strip _next assets
    fs.writeFileSync('.open-next/.nojekyll', '');
    console.log('✓ .nojekyll written');

    console.log('\n✅ Build complete — Cloudflare will deploy .open-next correctly.\n');
  } catch (error) {
    console.error('\n❌ Build FAILED:', error.message);
    process.exit(1);
  }
}

runBuild();
