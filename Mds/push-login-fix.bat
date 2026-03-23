@echo off
cd /d "%~dp0"

echo Agregando fix de login...
git add .

echo Haciendo commit...
git commit -m "Fix: Permitir login con username o email en backend"

echo Haciendo push...
git push

echo.
echo ===================================
echo Listo! Render redesplegara en ~5 min
echo Podras usar "superadmin" sin @
echo ===================================
pause
