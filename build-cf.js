const { execSync } = require('child_process');
const fs = require('fs');

async function runBuild() {
  try {
    console.log('\n--- Cleaning previous builds ---');
    if (fs.existsSync('.open-next')) {
        fs.rmSync('.open-next', { recursive: true, force: true });
    }

    // Ensure database is in sync with schema before build
    console.log('\n🗄️ Syncing Database Schema: npx prisma db push --accept-data-loss');
    try {
      execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
    } catch (dbErr) {
      console.warn('⚠️ Warning: Prisma DB Push failed. Check your DATABASE_URL connectivity.');
    }

    // Core build command execution
    console.log('\n🚀 Running: npx @opennextjs/cloudflare build');
    execSync('npx @opennextjs/cloudflare build --dangerouslyUseUnsupportedNextVersion', { stdio: 'inherit' });

    // In OpenNext 1.19+, the .open-next folder is designed for Cloudflare.
    // It contains the _worker.js and assets/ directory.
    // Cloudflare Pages expects the output dir to contain either a _worker.js 
    // or a folder of static files. 
    
    console.log('\n✨ Success: Standard OpenNext build complete.');
  } catch (error) {
    console.error('\n❌ Build failed:');
    console.error(error.message);
    process.exit(1);
  }
}

runBuild();
