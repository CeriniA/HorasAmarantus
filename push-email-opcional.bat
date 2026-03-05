@echo off
cd /d "%~dp0"

echo.
echo ===================================
echo EMAIL OPCIONAL - USERNAME OBLIGATORIO
echo ===================================
echo.
echo IMPORTANTE: Antes de ejecutar este script
echo debes ejecutar la migracion SQL en Supabase!
echo.
echo Archivo: MIGRACION_EMAIL_OPCIONAL.sql
echo.
pause

echo.
echo Agregando cambios...
git add .

echo Haciendo commit...
git commit -m "Feature: Email opcional y username obligatorio"

echo Haciendo push...
git push

echo.
echo ===================================
echo CAMBIOS ENVIADOS
echo ===================================
echo.
echo Cambios realizados:
echo - Username ahora es obligatorio
echo - Email ahora es opcional
echo - Login acepta username o email
echo - Formularios actualizados
echo - Navbar muestra @username
echo.
echo Espera ~3 minutos para el deploy
echo.
echo RECUERDA: Ejecutar la migracion SQL
echo en Supabase si aun no lo hiciste!
echo.
pause
