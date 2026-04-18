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

    console.log('\n✨ Success: OpenNext build finished! Wrangler will now automatically bundle and deploy your full-stack app.');
  } catch (error) {
    console.error('\n❌ Build failed:');
    console.error(error.message);
    process.exit(1);
  }
}

runBuild();
