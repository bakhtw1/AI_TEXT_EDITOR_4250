echo "Setting Up stuff"
set BASEPATH=%1

if %BASEPATH% EQU "" set BASEPATH=.

python3 -m venv %BASEPATH%\venv

call %BASEPATH%\venv\Scripts\activate.bat
pip install -r %BASEPATH%\requirements.txt
echo "Finished setting up"