echo "Setting Up stuff"
set BASEPATH=%1

if %BASEPATH% EQU "" set BASEPATH=.

start python3.exe -m venv %BASEPATH%\venv

call %BASEPATH%\venv\Scripts\activate.bat
start pip.exe install -r %BASEPATH%\requirements.txt
echo "Finished setting up"