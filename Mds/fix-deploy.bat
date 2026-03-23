@echo off
echo Agregando archivos faltantes al repositorio...

cd /d "%~dp0"

git add frontend/src/offline/core/migrations.js
git add frontend/src/offline/
git add frontend/src/db/
git add frontend/src/utils/
git add frontend/src/hooks/
git add frontend/src/services/

echo.
echo Haciendo commit...
git commit -m "Fix: Agregar archivos offline faltantes para deploy"

echo.
echo Haciendo push...
git push

echo.
echo ===================================
echo Listo! Ahora Render redesplegara automaticamente
echo ===================================
pause
