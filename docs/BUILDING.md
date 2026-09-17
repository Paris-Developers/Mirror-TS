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
- Python 3.9 or newer, optionally. It lets `youtube-dl-exec` install, which gives the music player its most reliable way of downloading from YouTube — worth having on a server, where YouTube is stricter than it is with a home connection. Without Python that one package is skipped and the player falls back to its other methods.

## Optional: stats for monitoring

Set `metrics_port` in `config.json` (for example `9464`) and rebuild to have the bot serve stats about itself at `http://127.0.0.1:<port>/metrics`, in the format Prometheus reads. They cover the bot's own CPU, memory and network traffic (including song downloads by yt-dlp), servers playing music, commands used, player errors, the gateway ping and the size of the `data` and `logs` folders. The stats are only reachable from the machine running the bot. Leave `metrics_port` empty to turn them off.

## Upgrading an existing install (discord.js 13 → 14)

Saved data (manager roles, birthdays, server colors, silenced users and so on) is stored with enmap, which moved from version 5 to 6. Version 6 can't open a version 5 database, so after pulling this update, stop the bot and run once:

- npm i
- node scripts/migrate-enmap-v5.js
- node scripts/faststart-intros.js
- ./build.bat
- npm start

The first script keeps the old database as `data/enmap.v5.sqlite`.

The second rewrites the saved intro themes in `data/intros`. Sound is now streamed through ffmpeg, and an mp4 that keeps its index at the end of the file cannot be read that way, so intros saved by older versions would play as silence. The script copies the audio without re-encoding it, so the files keep their quality and size.
