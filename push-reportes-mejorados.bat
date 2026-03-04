@echo off
cd /d "%~dp0"

echo Guardando mejoras en reportes...
git add .

echo Haciendo commit...
git commit -m "Feature: Mejorar reportes con filtrado jerarquico de areas y procesos"

echo Haciendo push...
git push

echo.
echo ===================================
echo REPORTES MEJORADOS
echo ===================================
echo.
echo Cambios:
echo - Filtro por area incluye procesos internos
echo - Tabla con jerarquia visual (indentacion)
echo - Indicador de filtro activo
echo - Porcentaje del total por unidad
echo - Colores por tipo de unidad
echo.
echo Espera ~3 minutos para el deploy
echo.
pause
