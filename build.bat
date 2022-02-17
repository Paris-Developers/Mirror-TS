@echo off
if exist .\built\ (
    echo Removing old built files
    rmdir /s /q .\built
)


Rem Construct SlashCommands.ts
echo Compiling slash commands into SlashCommands.ts
cd src\slashcommands
@echo //Autobuilt by build.bat > SlashCommands.ts

Rem Import all the files
for /r %%f in (.\*) do (
    if NOT "%%~nf"=="SlashCommands" (
        echo import { %%~nf } from './%%~nf'; >> SlashCommands.ts
    )
)
Rem Construct array
echo.>> SlashCommands.ts
(ECHO export let SlashCommands^: Array^<SlashCommand^> = ^[) >> SlashCommands.ts
for /r %%f in (.\*) do (
    if NOT "%%~nf"=="SlashCommand" (
        if NOT "%%~nf"=="SlashCommands" (
            echo %TAB% new %%~nf^(^),>> SlashCommands.ts
        )
    )
)
echo ^];>> SlashCommands.ts
cd ../..


Rem Construct MessageCommands.ts
echo Compiling message commands into MessageCommands.ts
cd src/messagecommands
@echo //Autobuilt by build.bat > MessageCommands.ts

Rem Import all the files
for /r %%f in (.\*) do (
    if NOT "%%~nf"=="MessageCommands" (
        echo import { %%~nf } from './%%~nf'; >> MessageCommands.ts
    )
)
Rem Construct array
echo.>> MessageCommands.ts
(ECHO export let MessageCommands^: Array^<MessageCommand^> = ^[) >> MessageCommands.ts
for /r %%f in (.\*) do (
    if NOT "%%~nf"=="MessageCommand" (
        if NOT "%%~nf"=="MessageCommands" (
            echo %TAB% new %%~nf^(^),>> MessageCommands.ts
        )
    )
)
echo ^];>> MessageCommands.ts
cd ../..


Rem Construct Keywords.ts
echo Compiling keywords into Keywords.ts
cd src/keywords
@echo //Autobuilt by build.bat > Keywords.ts

Rem Import all the files
for /r %%f in (.\*) do (
    if NOT "%%~nf"=="Keywords" (
        echo import { %%~nf } from './%%~nf'; >> Keywords.ts
    )
)
Rem Construct array
echo.>> Keywords.ts
(ECHO export let Keywords^: Array^<Keyword^> = ^[) >> Keywords.ts
for /r %%f in (.\*) do (
    if NOT "%%~nf"=="Keyword" (
        if NOT "%%~nf"=="Keywords" (
            echo %TAB% new %%~nf^(^),>> Keywords.ts
        )
    )
)
echo ^];>> Keywords.ts
cd ../..


echo Building files
node .\node_modules\typescript\bin\tsc