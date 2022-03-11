#!/bin/bash

BASEPATH="$1"
PYTHON_EXECUTABLE="$BASEPATH/venv/bin/python"

if [[ "$BASEPATH" == "" ]]
then
    BASEPATH="."
    PYTHON_EXECUTABLE="python"
fi

FLASK_ENV=development $PYTHON_EXECUTABLE $BASEPATH/server.py