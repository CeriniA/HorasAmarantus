@echo off
cd /d "%~dp0"

echo Agregando cambios...
git add .

echo Haciendo commit...
git commit -m "Fix: Permitir login con username sin @ (superadmin)"

echo Haciendo push...
git push

echo.
echo ===================================
echo Listo! Render redesplegara en ~3 min
echo ===================================
pause
