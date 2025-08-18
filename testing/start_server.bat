@echo off
echo Starting HTTP server for AI Benchmarks...
echo.
echo Navigate to: http://localhost:8000
echo Press Ctrl+C to stop the server
echo.
cd /d "C:\Users\kelle\OneDrive\Documents\GitHub\kaileh-website\testing"
python -m http.server 8000
pause
