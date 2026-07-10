@echo off
REM Windows-friendly starter (avoids PowerShell npm.ps1 execution policy issues)
cd /d "%~dp0"
npm.cmd run dev -- --host
