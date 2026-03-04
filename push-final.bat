@echo off
cd /d "%~dp0"

echo Aplicando solucion final compatible...
git add .

echo Haciendo commit...
git commit -m "Fix: Arquitectura API compatible - health sin doble /api"

echo Haciendo push...
git push

echo.
echo ===================================
echo SOLUCION FINAL APLICADA
echo ===================================
echo.
echo Cambios:
echo - Health check usa /health (sin /api)
echo - api.js sin /api en fallback
echo - Compatible con todo
echo.
echo Espera ~3 minutos para el deploy
echo.
pause
