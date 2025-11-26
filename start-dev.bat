@echo off
echo Starting LifeLink Development Servers...
echo.

echo Starting Backend Server on port 5000...
cd backend
start "LifeLink Backend" cmd /k "npm run dev"

timeout /t 3

echo Starting Frontend Server on port 3000...
cd ../frontend  
start "LifeLink Frontend" cmd /k "npm run dev"

cd ..

echo.
echo =================================
echo   LifeLink Development Started!
echo =================================
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:5000
echo =================================
echo.

pause
