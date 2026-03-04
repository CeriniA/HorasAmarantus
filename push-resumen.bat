@echo off
cd /d "%~dp0"

echo Guardando resumen ejecutivo mejorado...
git add .

echo Haciendo commit...
git commit -m "Docs: Mejorar seccion de reportes con discriminacion jerarquica"

echo Haciendo push...
git push

echo.
echo ===================================
echo RESUMEN EJECUTIVO ACTUALIZADO
echo ===================================
echo.
echo Cambios:
echo - Reportes por area con discriminacion completa
echo - Ejemplo visual de jerarquia
echo - Casos de uso mas detallados
echo.
pause
