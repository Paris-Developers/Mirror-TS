#!/bin/bash
if [ -d "./built" ]; then
    echo "Removing old built files"
    rm -r ./built
fi


#Construct SlashCommands.ts
echo "Compiling slash commands into SlashCommands.ts"
cd src/slashcommands
echo "//Autobuilt by build.sh" > SlashCommands.ts


for f in "./"/*
do
    filename=$(basename $f)
    importName=${filename##*/}
    echo $importName
done