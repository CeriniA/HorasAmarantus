@echo off
cd /d "%~dp0"

echo Agregando fix de health check...
git add .

echo Haciendo commit...
git commit -m "Fix: Health check usar URL correcta del backend"

echo Haciendo push...
git push

echo.
echo ===================================
echo Listo! Render redesplegara en ~3 min
echo El health check usara la URL correcta
echo ===================================
echo.
echo Verifica en Render que VITE_API_URL este configurado:
echo VITE_API_URL=https://horasamarantus-backend.onrender.com
echo.
pause
