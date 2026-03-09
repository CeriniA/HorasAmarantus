@echo off
cd /d "%~dp0"

echo.
echo ===================================
echo CARGA MASIVA DE JORNADA
echo ===================================
echo.
echo Funcionalidad implementada:
echo - Cargar multiples procesos de una vez
echo - Seleccion flexible de areas y procesos
echo - Validacion de solapamientos
echo - Deteccion de gaps (huecos)
echo - Calculo automatico de horas
echo - Endpoint backend /api/time-entries/bulk
echo.
pause

echo.
echo Agregando cambios...
git add .

echo Haciendo commit...
git commit -m "Feature: Carga masiva de jornada completa"

echo Haciendo push...
git push

echo.
echo ===================================
echo CAMBIOS ENVIADOS
echo ===================================
echo.
echo Nuevas funcionalidades:
echo.
echo 1. Pagina "Cargar Jornada"
echo    - Agregar/eliminar procesos dinamicamente
echo    - Seleccion de area y proceso por entrada
echo    - Campos de hora inicio/fin
echo    - Descripcion opcional
echo.
echo 2. Validaciones
echo    - No solapamientos de horarios
echo    - Hora fin mayor que hora inicio
echo    - Deteccion de gaps entre procesos
echo    - Advertencia si total != 8 horas
echo.
echo 3. Backend
echo    - POST /api/time-entries/bulk
echo    - Validacion de multiples entradas
echo    - Insercion atomica (todo o nada)
echo    - Calculo de total de horas
echo.
echo 4. UX Mejorada
echo    - Auto-sugerir hora inicio = hora fin anterior
echo    - Total de horas en tiempo real
echo    - Resumen con advertencias
echo    - Boton destacado en Registro de Horas
echo.
echo Espera ~3 minutos para el deploy
echo.
pause
