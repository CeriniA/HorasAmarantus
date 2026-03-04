@echo off
cd /d "%~dp0"

echo Corrigiendo menu hamburguesa...
git add .

echo Haciendo commit...
git commit -m "Fix: Mostrar Usuarios en menu movil para superadmin"

echo Haciendo push...
git push

echo.
echo ===================================
echo MENU HAMBURGUESA CORREGIDO
echo ===================================
echo.
echo - Usuarios ahora visible para superadmin
echo - Ruta corregida a /admin/users
echo - Consistente con menu desktop
echo.
echo Espera ~3 minutos para el deploy
echo.
pause
