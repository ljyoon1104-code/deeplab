@echo off
setlocal EnableExtensions

set "APP_ROOT=%~dp0"
set "APP_URL=http://localhost:5173/deeplab/"
set "PACKAGE_COMMAND="
set "POWERSHELL_EXE=%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe"

cd /d "%APP_ROOT%" || goto :path_error

call :server_ready
if not errorlevel 1 goto :open_browser

where npm.cmd >nul 2>&1
if not errorlevel 1 set "PACKAGE_COMMAND=npm.cmd"

if not defined PACKAGE_COMMAND (
  where pnpm.cmd >nul 2>&1
  if not errorlevel 1 set "PACKAGE_COMMAND=pnpm.cmd"
)

if not defined PACKAGE_COMMAND goto :missing_node

if not exist "%APP_ROOT%node_modules\" (
  echo Installing project packages...
  call %PACKAGE_COMMAND% install
  if errorlevel 1 goto :install_failed
)

start "Deep Learning Lab Dev Server" /D "%APP_ROOT%" cmd.exe /k %PACKAGE_COMMAND% run dev

call :wait_for_server
if errorlevel 1 goto :server_failed

:open_browser
start "" "%APP_URL%"
exit /b 0

:server_ready
"%POWERSHELL_EXE%" -NoLogo -NoProfile -ExecutionPolicy Bypass -Command "try { $response = Invoke-WebRequest -UseBasicParsing -Uri $env:APP_URL -TimeoutSec 2; if ($response.StatusCode -ge 200) { exit 0 } } catch {}; exit 1"
exit /b %errorlevel%

:wait_for_server
"%POWERSHELL_EXE%" -NoLogo -NoProfile -ExecutionPolicy Bypass -Command "for ($i = 0; $i -lt 60; $i++) { try { $response = Invoke-WebRequest -UseBasicParsing -Uri $env:APP_URL -TimeoutSec 1; if ($response.StatusCode -ge 200) { exit 0 } } catch {}; Start-Sleep -Seconds 1 }; exit 1"
exit /b %errorlevel%

:missing_node
echo Node.js and npm were not found.
echo Install Node.js 20.19 or later, then run this file again.
pause
exit /b 1

:install_failed
echo Package installation failed.
pause
exit /b 1

:server_failed
echo The development server did not become ready.
echo Check the Deep Learning Lab Dev Server window for details.
pause
exit /b 1

:path_error
echo The project folder could not be opened.
pause
exit /b 1
