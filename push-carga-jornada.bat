@echo off
cd /d "%~dp0"

echo.
echo ===================================
echo CARGA MASIVA DE JORNADA
echo ===================================
echo.
echo Funcionalidad implementada:
echo - Diseno compacto con areas colapsables
echo - Checkboxes + horarios en linea
echo - Soporte para subprocesos jerarquicos
echo - Selector de usuario para superadmin
echo - Agregar areas dinamicamente
echo - Validacion de solapamientos y gaps
echo - Calculo automatico de horas
echo - Endpoint backend /api/time-entries/bulk
echo.
pause

echo.
echo Agregando cambios...
git add .

echo Haciendo commit...
git commit -m "Feature: Carga masiva de jornada con diseño compacto y jerárquico"

echo Haciendo push...
git push

echo.
echo ===================================
echo CAMBIOS ENVIADOS
echo ===================================
echo.
echo Nuevas funcionalidades:
echo.
echo 1. Diseno Compacto
echo    - Areas colapsables (acordeon)
echo    - Checkboxes + horarios en la misma linea
echo    - Vista compacta sin scroll excesivo
echo    - Fecha unica arriba
echo.
echo 2. Jerarquia de Procesos
echo    - Soporte para subprocesos
echo    - Indentacion visual
echo    - Auto-expansion al checkear padre
echo    - Horarios independientes por nivel
echo.
echo 3. Selector de Usuario (Superadmin)
echo    - Dropdown para seleccionar usuario
echo    - Cargar horas para otros usuarios
echo    - Solo visible para superadmin
echo.
echo 4. Agregar Areas Dinamicamente
echo    - Boton "Agregar Otra Area"
echo    - Dropdown con areas disponibles
echo    - Multiples areas en la misma jornada
echo.
echo 5. Validaciones
echo    - No solapamientos de horarios
echo    - Deteccion de gaps entre procesos
echo    - Advertencia si total != 8 horas
echo    - Calculo en tiempo real
echo.
echo Espera ~3 minutos para el deploy
echo.
pause
