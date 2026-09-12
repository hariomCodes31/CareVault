@echo off
title Push CareVault to GitHub
color 0A
cd /d "%~dp0"
echo ==============================================================
echo   Pushing 'frontened' branch to GitHub (hariomCodes31/CareVault)
echo ==============================================================
git push -u origin frontened
echo.
echo ==============================================================
if %ERRORLEVEL% EQU 0 (
    echo   SUCCESS! Branch 'frontened' has been pushed to GitHub!
) else (
    echo   Push failed or requires authentication.
)
echo ==============================================================
pause
