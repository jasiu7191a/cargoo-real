@echo off
setlocal
echo ==================================================
echo   Cargoo Platform - Forced Push Solution
echo ==================================================
echo.
echo Attempting to force a Git Push...
echo.
git add .
git commit -m "Forced 25MB build fix rollout"
git push origin main
echo.
echo ==================================================
echo If you saw 'Everything up-to-date', please check 
echo your GitHub Desktop app and click 'Push Origin'.
echo ==================================================
pause
