#!/bin/bash
DIR = "build"
# check if build directory exists
if [ -d $DIR ]; then
# if it does, delete it
    rm -rf $DIR
    echo "Deleted old build directory"
fi
echo "Creating build directory"
mkdir -p $DIR

echo "compiling files"
babel server --out-dir build/server
babel controllers --out-dir build/controllers
babel models --out-dir build/models
babel routes --out-dir build/routes
babel config --out-dir build/config
babel tests --out-dir build/test

echo "Copying public files to build directory"
cp -r public build/public

