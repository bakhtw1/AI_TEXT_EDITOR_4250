#!/bin/bash

BASEPATH="$1"

if [[ "$BASEPATH" == "" ]]
then
    BASEPATH="."
fi

python3 -m venv $BASEPATH/venv
source $BASEPATH/venv/bin/activate
pip install -r $BASEPATH/requirements.txt
