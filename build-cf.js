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

    // 5. Flatten assets/ into output root.
    //    Cloudflare Pages ASSETS auto-binding only covers files at the ROOT of
    //    pages_build_output_dir. Files inside assets/ subdirectory are NOT served.
    //    We move them up so env.ASSETS.fetch("/_next/static/...") resolves correctly.
    const assetsDir = path.join('.open-next', 'assets');
    if (fs.existsSync(assetsDir)) {
      console.log('📦 Flattening assets to .open-next/ root...');
      for (const item of fs.readdirSync(assetsDir)) {
        const src  = path.join(assetsDir, item);
        const dest = path.join('.open-next', item);
        if (!fs.existsSync(dest)) {
          fs.cpSync(src, dest, { recursive: true });
        }
        console.log(`   ✓ ${item}`);
      }
      fs.rmSync(assetsDir, { recursive: true, force: true });
      console.log('   ✓ assets/ subfolder removed (all contents now at root)');
    }

    // 6. Prevent Cloudflare from stripping underscore-prefixed folders
    fs.writeFileSync('.open-next/.nojekyll', '');
    console.log('✓ .nojekyll written');

    // 7. Write _routes.json to bypass the worker for static assets.
    //    When _worker.js is present, Cloudflare Pages routes ALL requests through
    //    the worker by default — including /_next/static/ CSS/JS files.
    //    _routes.json "exclude" entries tell Pages to serve those paths directly
    //    from the CDN (Assets), bypassing the worker entirely. This fixes CSS 404s.
    const routesJson = {
      version: 1,
      include: ["/*"],
      exclude: [
        "/_next/static/*",
        "/_next/image*",
        "/favicon.ico",
        "/robots.txt",
        "/sitemap.xml",
        "/*.png",
        "/*.jpg",
        "/*.svg",
        "/*.ico",
        "/*.webp",
        "/*.woff2",
        "/*.woff",
      ],
    };
    fs.writeFileSync('.open-next/_routes.json', JSON.stringify(routesJson, null, 2));
    console.log('✓ _routes.json written (static assets bypass worker)');

    console.log('\n✅ Build complete!\n');
  } catch (error) {
    console.error('\n❌ Build FAILED:', error.message);
    process.exit(1);
  }
}

runBuild();
