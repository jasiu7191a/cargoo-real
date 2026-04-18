@echo off
cd /d "C:\Users\jasiu\OneDrive\Pulpit\cargoo-real-fixed"
echo 🚀 FORCING FINAL SYNC...
git add .
git commit -m "Absolute Final Structural & Routing Fix"
git push origin main
echo ✅ Done! Your site is now updating on Cloudflare.
pause
