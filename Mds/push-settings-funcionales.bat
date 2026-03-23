@echo off
cd /d "%~dp0"

echo.
echo ===================================
echo CONFIGURACION FUNCIONAL
echo ===================================
echo.
echo Cambios implementados:
echo - Cambio de contrasena habilitado
echo - Edicion de email habilitada
echo - Notificaciones simplificadas
echo - Endpoints en backend creados
echo.
pause

echo.
echo Agregando cambios...
git add .

echo Haciendo commit...
git commit -m "Feature: Habilitar cambio de contrasena y edicion de email en Settings"

echo Haciendo push...
git push

echo.
echo ===================================
echo CAMBIOS ENVIADOS
echo ===================================
echo.
echo Funcionalidades habilitadas:
echo.
echo 1. Cambio de Contrasena
echo    - Requiere contrasena actual
echo    - Minimo 8 caracteres
echo    - Validacion en frontend y backend
echo.
echo 2. Actualizacion de Email
echo    - Email opcional (puede dejarse vacio)
echo    - Validacion de formato
echo    - Verificacion de unicidad
echo.
echo 3. Notificaciones
echo    - Seccion simplificada
echo    - Mensaje de "proximamente"
echo.
echo Espera ~3 minutos para el deploy
echo.
pause
