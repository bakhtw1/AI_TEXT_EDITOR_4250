#!/bin/bash

BASEPATH="$1"
PYTHON_EXECUTABLE="$BASEPATH/venv/bin/python"

if [[ "$BASEPATH" == "" ]]
then
    BASEPATH="."
    PYTHON_EXECUTABLE="python"
fi

PYTHONPATH=`pwd`/torch-mlir/build/cmake_build/tools/torch-mlir/python_packages/torch_mlir:`pwd`/torch-mlir/examples

if [[ "$OSTYPE" == "darwin"* && "$(arch)" == "arm64" ]]
then
    PYTHONPATH=$PYTHONPATH:`pwd`/SHARK/build/bindings/python:`pwd`/SHARK/build/compiler-api/python_package
fi

PYTHONPATH=$PYTHONPATH FLASK_ENV=development $PYTHON_EXECUTABLE $BASEPATH/model_server.py