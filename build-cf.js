// Cargoo Admin Platform — Build v5 — Correct OpenNext + Cloudflare Pages pattern
// OpenNext generates: .open-next/worker.js + .open-next/assets/
// Cloudflare Pages requires: _worker.js at root + serves assets/ automatically via ASSETS binding
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function runBuild() {
  try {
    // 1. Clean previous build
    console.log('\n--- Cleaning previous build ---');
    if (fs.existsSync('.open-next')) {
      fs.rmSync('.open-next', { recursive: true, force: true });
    }

    // 2. Sync DB schema
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

    // 4. Cloudflare Pages requires _worker.js (with underscore prefix)
    //    OpenNext outputs worker.js — rename it.
    const workerSrc  = path.join('.open-next', 'worker.js');
    const workerDest = path.join('.open-next', '_worker.js');
    if (!fs.existsSync(workerSrc)) {
      throw new Error('worker.js NOT found in .open-next/ — OpenNext build may have failed.');
    }
    fs.renameSync(workerSrc, workerDest);
    console.log('✓ Renamed worker.js → _worker.js  (Cloudflare Pages entrypoint)');

    // 5. DO NOT flatten assets/. 
    //    Cloudflare Pages automatically wires .open-next/assets/ as the ASSETS binding
    //    for the _worker.js. Moving files to the root breaks this binding.
    //    The worker (built by OpenNext) already calls env.ASSETS.fetch() for static files.
    console.log('✓ Assets left in .open-next/assets/ (Cloudflare Pages ASSETS binding auto-wired)');

    // 6. Prevent GitHub Pages / Cloudflare from stripping underscore-prefixed folders
    fs.writeFileSync('.open-next/.nojekyll', '');
    console.log('✓ .nojekyll written');

    console.log('\n✅ Build complete!\n');
  } catch (error) {
    console.error('\n❌ Build FAILED:', error.message);
    process.exit(1);
  }
}

runBuild();
