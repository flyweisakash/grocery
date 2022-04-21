#!/bin/bash
mkdir -p build
babel server --out-dir build/server
babel contollers --out-dir build/contollers
babel models --out-dir build/models
babel routes --out-dir build/routes
babel config --out-dir build/config
babel test --out-dir build/test
cp -r public build/public

