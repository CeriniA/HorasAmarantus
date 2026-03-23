@echo off
cd /d "%~dp0"

echo Agregando icono SVG y actualizando manifest...
git add .

echo Haciendo commit...
git commit -m "Fix: Agregar icono SVG y corregir manifest PWA"

echo Haciendo push...
git push

echo.
echo ===================================
echo Listo! Render redesplegara en ~3 min
echo Los errores 404 de iconos desapareceran
echo ===================================
pause
