#!/bin/bash

# # Install Torch-MLIR
# git clone https://github.com/llvm/torch-mlir
# cd torch-mlir
# git submodule update --init --progress
CMAKE_GENERATOR=Ninja python setup.py bdist_wheel
# export PYTHONPATH=$PYTHONPATH:`pwd`/build/tools/torch-mlir/python_packages/torch_mlir:`pwd`/examples

# # Install SHARK
# git clone https://github.com/NodLabs/SHARK.git
# cd SHARK
# git submodule update --init --progress
# cmake -GNinja -B ../iree-build/ -S . \
#     -DCMAKE_BUILD_TYPE=RelWithDebInfo \
#     -DIREE_ENABLE_ASSERTIONS=ON \
#     -DCMAKE_C_COMPILER=clang \
#     -DCMAKE_CXX_COMPILER=clang++ \
#     -DIREE_ENABLE_LLD=ON
# cmake --build ../iree-build/
# cmake \
#     -GNinja \
#     -DCMAKE_BUILD_TYPE=RelWithDebInfo \
#     -DIREE_BUILD_PYTHON_BINDINGS=ON \
#     -DPython3_EXECUTABLE="$(which python)" \
#     .
# cmake --build .
# export PYTHONPATH=$PYTHONPATH:`pwd`/bindings/python:`pwd`/compiler-api/python_package