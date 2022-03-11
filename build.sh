#!/bin/bash
if [ -d "./built" ]; then
    echo "Removing old built files"
    rm -r ./built
fi

echo "Building files"
node ./node_modules/typescript/bin/tsc