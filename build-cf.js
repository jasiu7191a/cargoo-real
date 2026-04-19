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

    // 4. Verify build succeeded — wrangler.json points to worker.js directly (no rename needed)
    const workerPath = path.join('.open-next', 'worker.js');
    const assetsPath = path.join('.open-next', 'assets');

    if (!fs.existsSync(workerPath)) {
      throw new Error('worker.js NOT found in .open-next/ — OpenNext build may have failed.');
    }
    if (!fs.existsSync(assetsPath)) {
      throw new Error('assets/ NOT found in .open-next/ — static assets are missing.');
    }
    console.log('✓ worker.js found');
    console.log('✓ assets/ directory found');

    console.log('\n✅ Build complete! Push to GitHub → Cloudflare will deploy automatically.\n');
  } catch (error) {
    console.error('\n❌ Build FAILED:', error.message);
    process.exit(1);
  }
}

runBuild();
