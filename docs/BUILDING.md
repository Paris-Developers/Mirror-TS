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
- icacls C:\Mirror-TS\node_modules\youtube-dl-exec\bin /grant:r "mirrorbot:(OI)(CI)M" (only once the folder is locked down, see "Keeping the PC safe" below)
- .\build.bat
- Start-Service MirrorBot

Stop the bot first: `npm ci` replaces all of `node_modules`, and Windows won't let it replace the native libraries a running bot has open.

Setting `YOUTUBE_DL_SKIP_PYTHON_CHECK` matters on a machine without Python: without it `npm ci` quietly leaves out yt-dlp, the most reliable way Mirror downloads from YouTube (the Windows yt-dlp doesn't need Python). Setting it once as a user environment variable on the bot's machine works too.

If `npm ci` or build.bat prints an error, fix it and run that step again before `Start-Service MirrorBot`: a failed `npm ci` leaves `node_modules` half installed, and build.bat deletes `built/` before compiling.

The service was created with [NSSM](https://nssm.cc/), which runs an ordinary program as a service. This is what the live bot's service is set to, as `nssm dump MirrorBot` reports it (`(Get-Command node).Source` prints the path to node on your machine, in case it isn't the usual one):

- nssm install MirrorBot "C:\Program Files\nodejs\node.exe"
- nssm set MirrorBot AppParameters "--disable-sigusr1 built\src\index.js"
- nssm set MirrorBot AppDirectory C:\Mirror-TS
- nssm set MirrorBot AppEnvironmentExtra :TZ=America/New_York
- nssm set MirrorBot AppStdout C:\Mirror-TS\logs\service-output.log
- nssm set MirrorBot AppStderr C:\Mirror-TS\logs\service-output.log
- nssm set MirrorBot DisplayName "Mirror Discord bot"
- nssm set MirrorBot ObjectName .\mirrorbot "the account's password"
- nssm set MirrorBot Start SERVICE_AUTO_START
- nssm set MirrorBot AppExit 78 Exit

`--disable-sigusr1` stops another Node program running under the same account from switching on Mirror's debugger, which would let it run anything it liked as Mirror. yt-dlp starts one of those: a node.exe that runs YouTube's own code inside Node's permission sandbox, and Node's [permissions page](https://nodejs.org/api/permissions.html) says a sandboxed process can still do this to another one with `process._debugProcess()`. Node documents the flag as turning off the `SIGUSR1` signal, and its source shows the flag also leaves out the hook that call uses on Windows. It needs Node 22.14 or newer. A service set up before this was added needs this one command, then `Restart-Service MirrorBot`:

- nssm set MirrorBot AppParameters "--disable-sigusr1 built\src\index.js"

`AppDirectory` matters: saved data lives in `./data`, so the service has to start in the project folder. The birthday crons read the machine's clock, so `AppEnvironmentExtra` pins the timezone the live bot has always used, whatever the host is set to. `ObjectName` runs the bot as its own limited account rather than as the system.

`AppExit 78 Exit` is the one line here that NSSM doesn't set by default, and the live service is missing it — worth adding. The service knows nothing about `ecosystem.config.js`, so the `stop_exit_codes` setting in there does nothing; without `AppExit 78 Exit`, a copy that refuses to log in is restarted for ever, writing a new log file each time. See "One copy per bot token" below.

### Running it with pm2 instead

`ecosystem.config.js` is still in the repo for running the bot under pm2 instead of as a service, which is handy on a machine you're logged into anyway. pm2 isn't one of Mirror's packages, so `npm ci` doesn't install it: if you go this way, install it separately once with `npm install -g pm2`. It starts the bot with the same `--disable-sigusr1` as the service, but that only covers Mirror itself: under pm2 everything runs as your own account, next to pm2's own background Node process, which doesn't get the flag. yt-dlp's sandboxed node.exe could switch on that process's debugger (or that of any other Node program you have running) and run code as you, so keep the live bot on the service, with its own account. Use one or the other, never both at once, or two copies of Mirror end up logged in with the same token. First time: `pm2 start ecosystem.config.js`, then `pm2 save`. To update, swap `Stop-Service`/`Start-Service` above for `pm2 stop Mirror` and `pm2 restart Mirror`. Changing `ecosystem.config.js` needs `pm2 delete Mirror`, `pm2 start ecosystem.config.js`, `pm2 save` once before `pm2 restart Mirror` is enough again.

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

## Keeping the PC safe

Mirror's invite link is public, so people you don't know can have it download and play things on the PC it runs on. These steps keep the damage small if something in that chain is ever tricked into running code, and keep the bot token out of reach of the PC's other accounts. Run them in an **Administrator PowerShell**.

### Lock down the project folder

`config.json` holds the bot token, and you build and update the code in this folder as Administrator, so only Administrators should be able to change anything in it. A folder made straight on `C:\` usually takes its permissions from `C:\`, which can let every account on the PC read it, and often change it. First see who can read `config.json` now:

```powershell
icacls C:\Mirror-TS\config.json
```

If that lists `BUILTIN\Users`, `NT AUTHORITY\Authenticated Users` or `Everyone`, other accounts could read the token. Once the folder is locked down, reset the token in the Discord Developer Portal (your application → Bot → Reset Token), put the new one in `config.json` and restart the bot. The API keys and YouTube cookie in there were just as readable, so renew those too.

Then lock it down. Administrators and SYSTEM keep full control; the bot's `mirrorbot` account can read everything but only change `data` (saved data and intros), `logs` and `node_modules\youtube-dl-exec\bin` (yt-dlp updates itself there); and the `LocalService` account Prometheus runs as can read `monitoring`, where its config is:

```powershell
cd C:\Mirror-TS
New-Item -ItemType Directory data, logs -Force | Out-Null
icacls C:\Mirror-TS /inheritance:r /grant:r "Administrators:(OI)(CI)F" "SYSTEM:(OI)(CI)F" "mirrorbot:(OI)(CI)RX"
icacls C:\Mirror-TS\data /grant:r "mirrorbot:(OI)(CI)M"
icacls C:\Mirror-TS\logs /grant:r "mirrorbot:(OI)(CI)M"
icacls C:\Mirror-TS\node_modules\youtube-dl-exec\bin /grant:r "mirrorbot:(OI)(CI)M"
icacls C:\Mirror-TS\monitoring /grant:r "NT AUTHORITY\LocalService:(OI)(CI)RX"
Restart-Service MirrorBot
```

`/inheritance:r` stops the folder taking permissions from `C:\`, `/grant:r` replaces what an account had instead of adding to it, and `(OI)(CI)` passes the permission on to every file and folder inside. `F` is full control, `M` is modify and `RX` is read (and run). The youtube-dl-exec line fails harmlessly if yt-dlp isn't installed. Check the result:

```powershell
icacls C:\Mirror-TS
icacls C:\Mirror-TS\config.json
icacls C:\Mirror-TS\data
```

The first two should list only `BUILTIN\Administrators`, `NT AUTHORITY\SYSTEM` and `mirrorbot` with `(RX)`; the third the same, with `mirrorbot` also given `(M)`. If one of them lists another account, take it off with `icacls <that path> /remove:g "<the account, as listed>"`. Then check the bot came up (see "Checking it came up" above), and if you set up the [monitoring](MONITORING.md), that its checks still pass.

From now on, changing anything in the folder (`git pull`, `npm ci`, editing `config.json`) needs an Administrator window, which is the point. `npm ci` deletes and recreates `node_modules`, so the youtube-dl-exec line has to be run again after each one; it is in "Updating the live bot" above. If `youtube_cookie_file` in `config.json` points into this folder, keep the cookie file in `data`: yt-dlp writes the file back after using it.

### Keep Node up to date

Node puts out security releases from time to time ([listed here](https://nodejs.org/en/blog/vulnerability)). When one comes out for the version the bot uses (24), `Stop-Service MirrorBot`, install the newest 24.x from [nodejs.org](https://nodejs.org/en/download) over the old one, then `Start-Service MirrorBot`. A running bot keeps the Node it started with until it restarts. To see which Node the running bot uses, run this in `C:\Mirror-TS`; it reads the version from the newest log:

```powershell
Get-ChildItem logs\*.log -Exclude service-output.log | Sort-Object LastWriteTime | Select-Object -Last 1 | Select-String '"runtimeVersion":"[0-9.]+"' | Select-Object -First 1 | ForEach-Object { $_.Matches.Value }
```

### Optional: a newer ffmpeg

ffmpeg reads every song and sound Mirror plays, and records intros. The copy that comes with Mirror (from ffmpeg-static) is FFmpeg 6.1.1, and it only changes when Mirror moves to an ffmpeg-static with a newer build. To use a current build instead, put it where only Administrators can change it, for example `C:\Program Files\ffmpeg\bin\ffmpeg.exe` (Windows builds are linked from [ffmpeg.org](https://ffmpeg.org/download.html)), and point the service at it with the `FFMPEG_BIN` environment variable, which ffmpeg-static hands to Mirror in place of its own copy.

`AppEnvironmentExtra` is one list, and setting it replaces the whole list, so set the timezone and `FFMPEG_BIN` together, each as its own `KEY=VALUE`:

```powershell
nssm set MirrorBot AppEnvironmentExtra TZ=America/New_York "FFMPEG_BIN=C:\Program Files\ffmpeg\bin\ffmpeg.exe"
nssm get MirrorBot AppEnvironmentExtra
Restart-Service MirrorBot
```

`nssm get` should list both. (NSSM's README also has `+KEY=VALUE` to add one variable and keep the others, and `-KEY` to remove one: `nssm set MirrorBot AppEnvironmentExtra -FFMPEG_BIN` goes back to the bundled copy.) The `Voice: ffmpeg ...` line in the new log shows the version and path in use.

### Optional: Deno for yt-dlp

YouTube only sends audio once yt-dlp has run a piece of JavaScript from YouTube's player, which by default it does in a node.exe started with Node's permission sandbox. Set `deno_path` in `config.json` to the full path of a `deno.exe` (2.3.0 or newer, kept where only Administrators can change it) and restart the bot, and yt-dlp runs that code in Deno's stricter sandbox instead, with no network, files or other programs; the log says at startup which one is used. JSON needs every `\` in the path written twice, for example `"deno_path": "C:\\Program Files\\deno\\deno.exe"`, or the bot can't read `config.json` and won't start.

### Optional: only run the install scripts you've approved

A package can run a script of its own while npm installs it, with the rights of whoever runs `npm ci`, here an Administrator. `allowScripts` in `package.json` lists the packages Mirror needs that for. The npm that comes with Node 24.22.1 (npm 11.19.1) only prints a warning about a package that isn't on the list, and runs its script anyway. To make `npm ci` stop instead, before it changes `node_modules`, run this once in `C:\Mirror-TS`, which saves the setting in a `.npmrc` file there:

```powershell
npm config set strict-allow-scripts=true --location=project
```

When `npm ci` stops on a package, `npm approve-scripts --allow-scripts-pending` lists every package that isn't on the list yet. At the time of writing that includes esbuild, which comes with discord-voip, so expect the first `npm ci` to stop on it. Once you've looked at what its script does, `npm approve-scripts <package>` adds it (or `npm deny-scripts <package>` refuses it). Do that in your own copy of Mirror, then commit and push the changed `package.json` and `git pull` it on the bot's PC; a change made on the bot's PC itself can get in the way of the next `git pull`.

## Requirements

- Node.js 22.14 or newer (the live bot runs Node 24). Older versions refuse to start the bot, because they don't know `--disable-sigusr1`
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
