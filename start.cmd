@echo off
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 goto missing_node
node "%~dp0scripts\start.cjs" %*
set "launch_result=%errorlevel%"
if "%launch_result%"=="0" exit /b 0
if /i "%~1"=="--no-open" exit /b %launch_result%
echo.
pause
exit /b %launch_result%

:missing_node
echo Для запуска установите Node.js 24 LTS: https://nodejs.org/en/download
echo После установки заново откройте этот файл.
pause
exit /b 1
