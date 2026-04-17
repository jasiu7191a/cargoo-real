const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function runBuild() {
  try {
    console.log('\n--- Cleaning previous builds ---');
    if (fs.existsSync('.open-next')) {
        fs.rmSync('.open-next', { recursive: true, force: true });
    }

    console.log('\n--- Starting Cloudflare Build ---');
    
    // We use OpenNext to build the project specifically for Cloudflare Pages
    console.log('\n🚀 Running: npx @opennextjs/cloudflare build');
    execSync('npx @opennextjs/cloudflare build --dangerouslyUseUnsupportedNextVersion', { stdio: 'inherit' });

    console.log('\n--- Starting Deployment ---');
    
    // CRITICAL FIX: Use 'wrangler pages deploy' instead of standard worker deploy
    console.log('\n🚀 Running: npx wrangler pages deploy .open-next');
    execSync('npx wrangler pages deploy .open-next', { stdio: 'inherit' });

    console.log('\n✅ Success: Build and Pages Deployment finished!');
  } catch (error) {
    console.error('\n❌ Build/Deploy failed:');
    console.error(error.message);
    process.exit(1);
  }
}

runBuild();
