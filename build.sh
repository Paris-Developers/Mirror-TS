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

#Construct MessageCommands.ts
echo "Compiling message commands into MessageCommands.ts"
cd src/messagecommands
echo "//Autobuilt by build.sh" > MessageCommands.ts

#Import all the files
for f in "./"/*
do
    filename=$(basename $f)
    importName=${filename%.*}
    if [ "$importName" != "MessageCommands" ]; then
        printf "import { %s } from './%s';\n" $importName $importName >> MessageCommands.ts
    fi
done
#Construct array
printf "\n">> MessageCommands.ts
printf "export let MessageCommands: Array<MessageCommand> = [\n" >> MessageCommands.ts
for f in "./"/*
do
    filename=$(basename $f)
    importName=${filename%.*}
    if [ "$importName" != "MessageCommands" ] && [ "$importName" != "MessageCommand" ]; then
        printf "    new %s(),\n" $importName>> MessageCommands.ts
    fi
done
printf "];" >> MessageCommands.ts
cd ../..

#Construct Keywords.ts
echo "Compiling keywords into Keywords.ts"
cd src/keywords
echo "//Autobuilt by build.sh" > Keywords.ts

#Import all the files
for f in "./"/*
do
    filename=$(basename $f)
    importName=${filename%.*}
    if [ "$importName" != "Keywords" ]; then
        printf "import { %s } from './%s';\n" $importName $importName >> Keywords.ts
    fi
done
#Construct array
printf "\n">> Keywords.ts
printf "export let Keywords: Array<Keyword> = [\n" >> Keywords.ts
for f in "./"/*
do
    filename=$(basename $f)
    importName=${filename%.*}
    if [ "$importName" != "Keywords" ] && [ "$importName" != "Keyword" ]; then
        printf "    new %s(),\n" $importName>> Keywords.ts
    fi
done
printf "];" >> Keywords.ts
cd ../..

echo "Building files"
node ./node_modules/typescript/bin/tsc