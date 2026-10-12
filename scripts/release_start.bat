@echo off
cd /d "%~dp0backend"
if not exist ".env" (
    copy env.example .env >nul
    echo First run: opening .env so you can enter your Twilio / Gmail details.
    echo Save and close Notepad to continue.
    notepad .env
)
echo Starting Sheets Merge Sender on http://localhost:3000
echo Leave this window open while using the app. Close it to stop.
start "" cmd /c "timeout /t 3 >nul & start http://localhost:3000"
"%~dp0runtime\node.exe" server.js
pause
