@echo off
if exist .\built\ (
    echo Removing old built files
    rmdir /s /q .\built
)

echo Building files
node .\node_modules\typescript\bin\tsc