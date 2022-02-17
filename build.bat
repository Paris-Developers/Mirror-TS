@echo off
echo Removing old built files
rmdir /s /q .\built
echo Building new files
tsc