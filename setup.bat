@echo off
echo ========================================
echo  Sistema de Horas - Setup Completo
echo ========================================
echo.

echo [1/4] Instalando dependencias raiz...
call npm install

echo.
echo [2/4] Instalando dependencias backend...
cd backend
call npm install
cd ..

echo.
echo [3/4] Instalando dependencias frontend...
cd frontend
call npm install
cd ..

echo.
echo ========================================
echo  Instalacion completada!
echo ========================================
echo.
echo Para iniciar el desarrollo:
echo   npm run dev
echo.
pause
