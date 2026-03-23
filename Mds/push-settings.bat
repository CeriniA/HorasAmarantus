@echo off
cd /d "%~dp0"

echo Agregando pagina de configuracion...
git add .

echo Haciendo commit...
git commit -m "Feature: Agregar pagina de Configuracion/Settings"

echo Haciendo push...
git push

echo.
echo ===================================
echo PAGINA DE CONFIGURACION CREADA
echo ===================================
echo.
echo Cambios:
echo - Nueva pagina Settings (/settings)
echo - Informacion del perfil
echo - Cambio de contrasena (UI lista)
echo - Notificaciones (placeholder)
echo - Info de la aplicacion
echo - Enlaces corregidos en Navbar
echo.
echo Espera ~3 minutos para el deploy
echo.
pause
