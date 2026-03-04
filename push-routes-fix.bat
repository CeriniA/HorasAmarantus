@echo off
cd /d "%~dp0"

echo Agregando rutas alternativas sin /api...
git add .

echo Haciendo commit...
git commit -m "Fix: Agregar rutas alternativas sin /api para compatibilidad"

echo Haciendo push...
git push

echo.
echo ===================================
echo IMPORTANTE: CONFIGURAR RENDER AHORA
echo ===================================
echo.
echo 1. Ve a Render Dashboard
echo 2. Backend: Verifica FRONTEND_URL
echo 3. Frontend: Verifica VITE_API_URL
echo 4. Espera ~8 minutos
echo.
echo Lee: CONFIGURAR_RENDER_AHORA.md
echo.
pause
