
set BASEPATH=%1

set PYTHON_EXE=%BASEPATH%\venv\Scripts\python.exe

if %BASEPATH% equ "" set BASEPATH=.
if %BASEPATH% equ "" set PYTHON_EXE=python

set FLASK_ENV=development
start %PYTHON_EXE% %BASEPATH%\server.py