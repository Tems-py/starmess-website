@echo off
setlocal
pushd "%~dp0"
set "STARMESS_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if exist "%STARMESS_NODE%" (
  "%STARMESS_NODE%" scripts\serve.mjs
) else (
  node scripts\serve.mjs
)
popd
pause
