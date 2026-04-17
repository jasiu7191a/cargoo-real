const { execSync } = require('child_process');
const fs = require('fs');

async function runBuild() {
  try {
    console.log('\n--- Cleaning previous builds ---');
    if (fs.existsSync('.open-next')) {
        fs.rmSync('.open-next', { recursive: true, force: true });
    }

    console.log('\n--- Starting Cloudflare Build ---');
    
    // We only need to run the build. 
    // Cloudflare Pages will automatically deploy the '.open-next' folder 
    // once this script finishes successfully.
    console.log('\n🚀 Running: npx @opennextjs/cloudflare build');
    execSync('npx @opennextjs/cloudflare build --dangerouslyUseUnsupportedNextVersion', { stdio: 'inherit' });

    console.log('\n✅ Success: Build finished! Cloudflare will now deploy the results.');
  } catch (error) {
    console.error('\n❌ Build failed:');
    console.error(error.message);
    process.exit(1);
  }
}

runBuild();
