#!/usr/bin/env python3
"""
Create batch files to easily start HTTP server for benchmarks
"""

import os
from pathlib import Path

# Get testing directory
testing_dir = Path(__file__).parent.parent / "testing"

# Create Windows batch file
batch_content = f"""@echo off
echo Starting HTTP server for AI Benchmarks...
echo.
echo Navigate to: http://localhost:8000
echo Press Ctrl+C to stop the server
echo.
cd /d "{testing_dir.absolute()}"
python -m http.server 8000
pause
"""

batch_file = testing_dir / "start_server.bat"
with open(batch_file, 'w') as f:
    f.write(batch_content)

# Create shell script for Unix systems
shell_content = f"""#!/bin/bash
echo "Starting HTTP server for AI Benchmarks..."
echo ""
echo "Navigate to: http://localhost:8000"
echo "Press Ctrl+C to stop the server"
echo ""
cd "{testing_dir.absolute()}"
python3 -m http.server 8000
"""

shell_file = testing_dir / "start_server.sh"
with open(shell_file, 'w') as f:
    f.write(shell_content)

# Make shell script executable
os.chmod(shell_file, 0o755)

print("Created server startup scripts:")
print(f"  Windows: {batch_file}")
print(f"  Unix/Mac: {shell_file}")
print()
print("To use the benchmarks:")
print("1. Run the appropriate script for your OS")
print("2. Open http://localhost:8000 in your browser")
print("3. Click on any benchmark to start testing!")