# Building and Running the bot

All build operations should be completed by running .uild.bat (or ./build.sh if running on linux)

This file will

- Delete old built files
- Import all the keywords, messagecommands, and slashcommands into their respective holding files
- Build the project using tsc

Typical workflow for running the bot on a fresh clone would be

- $env:YOUTUBE_DL_SKIP_PYTHON_CHECK = "1" (in PowerShell; in Command Prompt, set YOUTUBE_DL_SKIP_PYTHON_CHECK=1)
- npm ci
- .uild.bat
- npm start

`npm ci` installs exactly the versions recorded in `package-lock.json`, which is kept in git, so every machine runs the libraries a change was tested with. Use `npm i <package>` only to add or update a package on purpose, and commit the updated `package-lock.json` along with `package.json`. Don't leave out optional packages (no `--omit=optional`): the voice encryption (DAVE) and opus encoder libraries are optional, per-machine packages, and voice crashes without them.

You must run .uild.bat and restart the bot whenever you make a change to the project's code. `config.json` is read when the bot starts, so a change to it only needs a restart.

## Updating the live bot

On the machine the live bot runs on, where pm2 runs it (first time: `pm2 start ecosystem.config.js`, then `pm2 save`):

- pm2 stop Mirror
- git pull
- $env:YOUTUBE_DL_SKIP_PYTHON_CHECK = "1" (in PowerShell; in Command Prompt, set YOUTUBE_DL_SKIP_PYTHON_CHECK=1)
- npm ci
- .uild.bat
- pm2 restart Mirror

Stop the bot first: `npm ci` replaces all of `node_modules`, and Windows won't let it replace the native libraries a running bot has open.

Setting `YOUTUBE_DL_SKIP_PYTHON_CHECK` matters on a machine without Python: without it `npm ci` quietly leaves out yt-dlp, the most reliable way Mirror downloads from YouTube (the Windows yt-dlp doesn't need Python). Setting it once as a user environment variable on the bot's machine works too.

If `npm ci` or build.bat prints an error, fix it and run that step again before `pm2 restart Mirror`: a failed `npm ci` leaves `node_modules` half installed, and build.bat deletes `built/` before compiling.

The first time after this update, restart the bot from the ecosystem file so pm2 picks up its settings (`pm2 delete Mirror`, `pm2 start ecosystem.config.js`, `pm2 save`). After that, `pm2 restart Mirror` is enough.

Each log in `logs/` starts by saying what is running: `Mirror is starting on <machine> in <mode> mode (commit ..., built ...)`. If the commit isn't the one just pulled, or the build time is older than the pull, the last two steps didn't happen. Next come one `Voice:` line per library the voice features need (DAVE, encryption, opus encoder, ffmpeg). A `Voice:` line logged as an error means that piece doesn't load, usually after an install that failed partway; run `npm ci` again. Once connected, `Logged in as <bot> (<id>) on <machine> in <mode> mode` names the bot account.

### Keeping the YouTube libraries current

The lock file holds every library at the version it was tested with, including the ones that talk to YouTube, and YouTube changes often enough to break old versions. (yt-dlp itself is the exception: `npm ci` downloads its newest release each time.) When YouTube playback starts failing, and every few weeks anyway, update them on a test copy, try a few songs, then commit the new `package-lock.json`:

- npm update youtubei.js discord-player-youtubei googlevideo
- .uild.bat

## One copy per bot token

Discord sends every command and voice event to every copy of the bot logged in with the same token. The copies race to answer each command, and they keep taking the voice connection away from each other, so music and intros break in every server while a second copy is running. A command the other copy answered first is logged as `error 40060`, with a note that another copy is probably running.

- Only the live bot uses the live bot's token. To test, make a separate application in the Discord developer portal, and put its token in the `config.json` on your own machine with `"mode": "debug"`.
- In debug mode the bot only acts in `test_server`: it ignores every other server and direct messages, registers its commands in that server only, and leaves the commands every server sees alone.
- Set `production_host` in the live bot's `config.json` to the name of the machine it runs on (the `Mirror is starting on ...` log line shows it; on Windows it's the computer name, and case doesn't matter), then restart. A production copy started on any other machine then refuses to log in and exits with code 78, which `ecosystem.config.js` tells pm2 not to restart. Left empty, the bot only logs a warning suggesting it.

## Requirements

- Node.js 22.12 or newer
- A `config.json` in the project folder: copy `config.example.json` and fill it in
- The **Message Content** intent enabled for the bot in the Discord developer portal (Bot → Privileged Gateway Intents); `$` commands and keywords need it
- Always start the bot from the project folder, since saved data lives in `./data`
- Python 3.9 or newer, optionally. It lets `youtube-dl-exec` install, which gives the music player its most reliable way of downloading from YouTube — worth having on a server, where YouTube is stricter than it is with a home connection. Without Python that one package is skipped and the player falls back to its other methods.

## Optional: stats for monitoring

Set `metrics_port` in `config.json` (for example `9464`) and restart to have the bot serve stats about itself at `http://127.0.0.1:<port>/metrics`, in the format Prometheus reads. They cover the bot's own CPU, memory and network traffic (including song downloads by yt-dlp), servers playing music, commands used, player errors, the gateway ping and the size of the `data` and `logs` folders. The stats are only reachable from the machine running the bot. Leave `metrics_port` empty to turn them off.

## Upgrading an existing install (discord.js 13 → 14)

Saved data (manager roles, birthdays, server colors, silenced users and so on) is stored with enmap, which moved from version 5 to 6. Version 6 can't open a version 5 database, so after pulling this update, stop the bot and run once:

- $env:YOUTUBE_DL_SKIP_PYTHON_CHECK = "1" (in PowerShell; in Command Prompt, set YOUTUBE_DL_SKIP_PYTHON_CHECK=1)
- npm ci
- node scripts/migrate-enmap-v5.js
- node scripts/faststart-intros.js
- .uild.bat
- npm start

The first script keeps the old database as `data/enmap.v5.sqlite`.

The second rewrites the saved intro themes in `data/intros`. Sound is now streamed through ffmpeg, and an mp4 that keeps its index at the end of the file cannot be read that way, so intros saved by older versions would play as silence. The script copies the audio without re-encoding it, so the files keep their quality and size.
