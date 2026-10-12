# Building and Running the bot

All build operations should be completed by running .\build.bat (or ./build.sh if running on linux)

This file will

- Delete old built files
- Build the project using tsc

Typical workflow for running the bot on a fresh clone would be

- $env:YOUTUBE_DL_SKIP_PYTHON_CHECK = "1" (in PowerShell; in Command Prompt, set YOUTUBE_DL_SKIP_PYTHON_CHECK=1)
- npm ci
- .\build.bat
- npm start

`npm ci` installs exactly the versions recorded in `package-lock.json`, which is kept in git, so every machine runs the libraries a change was tested with. Use `npm i <package>` only to add or update a package on purpose, and commit the updated `package-lock.json` along with `package.json`. Don't leave out optional packages (no `--omit=optional`): the voice encryption (DAVE) and opus encoder libraries are optional, per-machine packages, and voice crashes without them.

You must run .\build.bat and restart the bot whenever you make a change to the project's code. `config.json` is read when the bot starts, so a change to it only needs a restart.

## Updating the live bot

The live bot runs as a Windows service called `MirrorBot`, so it starts with the machine and nobody has to be logged in. In an **Administrator PowerShell** on that machine, from the folder it was cloned into (`C:\Mirror-TS` on the current one):

- Stop-Service MirrorBot
- git pull
- $env:YOUTUBE_DL_SKIP_PYTHON_CHECK = "1" (in PowerShell; in Command Prompt, set YOUTUBE_DL_SKIP_PYTHON_CHECK=1)
- npm ci
- .\build.bat
- Start-Service MirrorBot

Stop the bot first: `npm ci` replaces all of `node_modules`, and Windows won't let it replace the native libraries a running bot has open.

Setting `YOUTUBE_DL_SKIP_PYTHON_CHECK` matters on a machine without Python: without it `npm ci` quietly leaves out yt-dlp, the most reliable way Mirror downloads from YouTube (the Windows yt-dlp doesn't need Python). Setting it once as a user environment variable on the bot's machine works too.

If `npm ci` or build.bat prints an error, fix it and run that step again before `Start-Service MirrorBot`: a failed `npm ci` leaves `node_modules` half installed, and build.bat deletes `built/` before compiling.

The service was created with [NSSM](https://nssm.cc/), which runs an ordinary program as a service. This is what the live bot's service is set to, as `nssm dump MirrorBot` reports it (`(Get-Command node).Source` prints the path to node on your machine, in case it isn't the usual one):

- nssm install MirrorBot "C:\Program Files\nodejs\node.exe"
- nssm set MirrorBot AppParameters built\src\index.js
- nssm set MirrorBot AppDirectory C:\Mirror-TS
- nssm set MirrorBot AppEnvironmentExtra :TZ=America/New_York
- nssm set MirrorBot AppStdout C:\Mirror-TS\logs\service-output.log
- nssm set MirrorBot AppStderr C:\Mirror-TS\logs\service-output.log
- nssm set MirrorBot DisplayName "Mirror Discord bot"
- nssm set MirrorBot ObjectName .\mirrorbot "the account's password"
- nssm set MirrorBot Start SERVICE_AUTO_START
- nssm set MirrorBot AppExit 78 Exit

`AppDirectory` matters: saved data lives in `./data`, so the service has to start in the project folder. The birthday crons read the machine's clock, so `AppEnvironmentExtra` pins the timezone the live bot has always used, whatever the host is set to. `ObjectName` runs the bot as its own limited account rather than as the system.

`AppExit 78 Exit` is the one line here that NSSM doesn't set by default, and the live service is missing it — worth adding. The service knows nothing about `ecosystem.config.js`, so the `stop_exit_codes` setting in there does nothing; without `AppExit 78 Exit`, a copy that refuses to log in is restarted for ever, writing a new log file each time. See "One copy per bot token" below.

### Running it with pm2 instead

`ecosystem.config.js` is still in the repo for running the bot under pm2 instead of as a service, which is handy on a machine you're logged into anyway. Use one or the other, never both at once, or two copies of Mirror end up logged in with the same token. First time: `pm2 start ecosystem.config.js`, then `pm2 save`. To update, swap `Stop-Service`/`Start-Service` above for `pm2 stop Mirror` and `pm2 restart Mirror`. Changing `ecosystem.config.js` needs `pm2 delete Mirror`, `pm2 start ecosystem.config.js`, `pm2 save` once before `pm2 restart Mirror` is enough again.

### Checking it came up

Each log in `logs/` starts by saying what is running: `Mirror is starting on <machine> in <mode> mode (commit ..., built ...)`. If the commit isn't the one just pulled, or the build time is older than the pull, the last two steps didn't happen. Next come one `Voice:` line per library the voice features need (DAVE, encryption, opus encoder, ffmpeg). A `Voice:` line logged as an error means that piece doesn't load, usually after an install that failed partway; run `npm ci` again. Once connected, `Logged in as <bot> (<id>) on <machine> in <mode> mode` names the bot account.

### Keeping the YouTube libraries current

The lock file holds every library at the version it was tested with, including the ones that talk to YouTube, and YouTube changes often enough to break old versions. (yt-dlp itself is the exception: `npm ci` downloads its newest release each time.) When YouTube playback starts failing, and every few weeks anyway, update them on a test copy, try a few songs, then commit the new `package-lock.json`:

- npm update youtubei.js discord-player-youtubei googlevideo
- .\build.bat

## One copy per bot token

Discord sends every command and voice event to every copy of the bot logged in with the same token. The copies race to answer each command, and they keep taking the voice connection away from each other, so music and intros break in every server while a second copy is running. A command the other copy answered first is logged as `error 40060`, with a note that another copy is probably running.

- Only the live bot uses the live bot's token. To test, make a separate application in the Discord developer portal, and put its token in the `config.json` on your own machine with `"mode": "debug"`.
- In debug mode the bot only acts in `test_server`: it ignores every other server and direct messages, registers its commands in that server only, and leaves the commands every server sees alone.
- Set `production_host` in the live bot's `config.json` to the name of the machine it runs on (the `Mirror is starting on ...` log line shows it; on Windows it's the computer name, and case doesn't matter), then restart. A production copy started on any other machine then refuses to log in and exits with code 78. Restarting it would only refuse again, so whatever runs the bot is told to leave it stopped: `nssm set MirrorBot AppExit 78 Exit` for the service, and `stop_exit_codes` in `ecosystem.config.js` for pm2. Left empty, the bot only logs a warning suggesting it.

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
- .\build.bat
- npm start

The first script keeps the old database as `data/enmap.v5.sqlite`.

The second rewrites the saved intro themes in `data/intros`. Sound is now streamed through ffmpeg, and an mp4 that keeps its index at the end of the file cannot be read that way, so intros saved by older versions would play as silence. The script copies the audio without re-encoding it, so the files keep their quality and size.
