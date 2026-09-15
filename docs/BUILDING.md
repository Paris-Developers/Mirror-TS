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

## Requirements

- Node.js 22.12 or newer
- A `config.json` in the project folder: copy `config.example.json` and fill it in
- The **Message Content** intent enabled for the bot in the Discord developer portal (Bot → Privileged Gateway Intents); `$` commands and keywords need it
- Always start the bot from the project folder, since saved data lives in `./data`

## Upgrading an existing install (discord.js 13 → 14)

Saved data (manager roles, birthdays, server colors, silenced users and so on) is stored with enmap, which moved from version 5 to 6. Version 6 can't open a version 5 database, so after pulling this update, stop the bot and run once:

- npm i
- node scripts/migrate-enmap-v5.js
- ./build.bat
- npm start

The script keeps the old database as `data/enmap.v5.sqlite`. Intro theme files in `data/intros` aren't affected.
