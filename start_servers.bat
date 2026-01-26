@echo off
start /b cmd /c "cd backend && server_run.bat"
start /b cmd /c "cd frontend && npm run dev"
start http://localhost:5173