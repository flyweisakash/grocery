#!/bin/bash
DIR="build"
# check if build directory exists
if [ -d $DIR ]; then
    # delete it
    rm -rf $DIR
    echo "Deleted old build directory"
fi
echo "\nCreating new build directory"
mkdir -p $DIR

echo "\nCopying files to build directory"
echo "building..."
babel server --out-dir build/server
babel controllers --out-dir build/controllers
babel models --out-dir build/models
babel routes --out-dir build/routes
babel config --out-dir build/config
# babel tests --out-dir build/test

echo "Copying public files to build directory"
cp -r public build/public

echo "\nBuild successful!"

