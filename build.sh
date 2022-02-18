#!/bin/bash
if [ -d "./built" ]; then
    echo "Removing old built files"
    rm -r ./built
fi


#Construct SlashCommands.ts
echo "Compiling slash commands into SlashCommands.ts"
cd src/slashcommands
echo "//Autobuilt by build.sh" > SlashCommands.ts

#Import all the files
for f in "./"/*
do
    filename=$(basename $f)
    importName=${filename%.*}
    if [ "$importName" != "SlashCommands" ]; then
        printf "import { %s } from './%s';\n" $importName $importName >> SlashCommands.ts
    fi
done
#Construct array
printf "\n">> SlashCommands.ts
printf "export let SlashCommands: Array<SlashCommand> = [\n" >> SlashCommands.ts
for f in "./"/*
do
    filename=$(basename $f)
    importName=${filename%.*}
    if [ "$importName" != "SlashCommands" ] && [ "$importName" != "SlashCommand" ]; then
        printf "    new %s(),\n" $importName>> SlashCommands.ts
    fi
done
printf "];" >> SlashCommands.ts
cd ../..