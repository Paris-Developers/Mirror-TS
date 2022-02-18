# Building and Running the bot

All build operations should be completed by running ./build.bat (or ./build.sh if running on linux)

This file will

- Delete old built files
- Import all the keywords, messagecommands, and slashcommands into their respective holding files
- Build the project using tsc

Typical workflow for running the bot on a fresh clone would be

- npm i
- ./build.bat
- npm start

You must run ./build.bat and restart the bot whenever you make a change to the project.
