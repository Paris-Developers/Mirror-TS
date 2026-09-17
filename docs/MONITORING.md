# Monitoring the bot

A Grafana dashboard showing what the bot is doing and what it costs the PC it runs on. Only the bot and the programs it starts are measured, so anything else on the machine (games, streaming) never shows up in it.

It's built for a Windows host where the bot runs as the `MirrorBot` service under its own account, `mirrorbot`, from `C:\Mirror-TS`.

| Piece | Job | Reachable from |
|---|---|---|
| The bot's stats (`metrics_port` in `config.json`) | What the bot is doing and the traffic it sends and receives | This machine only (`127.0.0.1:9464`) |
| windows_exporter | CPU, memory and I/O of the bot's processes | This machine only (`127.0.0.1:9182`) |
| Prometheus | Stores 30 days of history | This machine only (`127.0.0.1:9090`) |
| Grafana | The dashboard | Port 3000, limited by the firewall to one other PC |

The config files live in `monitoring/`.

## Setup

Run everything in an **Administrator PowerShell** on the machine running the bot.

### 1. Turn on the bot's stats

```powershell
cd C:\Mirror-TS
Stop-Service MirrorBot
git pull
npm install
notepad config.json
```

In `config.json`, add `"metrics_port": 9464,` inside the braces, then save the file and continue:

```powershell
.\build.bat
Start-Service MirrorBot
```

Check it after about 30 seconds. This should print the number of servers:

```powershell
(Invoke-WebRequest -UseBasicParsing http://127.0.0.1:9464/metrics).Content -split "`n" | Select-String "^mirror_guilds"
```

### 2. windows_exporter

```powershell
winget download -e --id Prometheus.WindowsExporter --download-directory C:\Temp\windows_exporter
$msi = (Get-ChildItem C:\Temp\windows_exporter -Filter *.msi | Select-Object -First 1).FullName
Start-Process msiexec.exe -Wait -ArgumentList '/i', $msi, '/qn', 'CONFIG_FILE=C:\Mirror-TS\monitoring\windows_exporter.yml', 'ENABLED_COLLECTORS=process,cpu', 'LISTEN_ADDR=127.0.0.1'
```

Check it. This should show lines ending in `mirrorbot`:

```powershell
(Invoke-WebRequest -UseBasicParsing http://127.0.0.1:9182/metrics).Content -split "`n" | Select-String "^windows_process_info" | Select-Object -First 5
```

### 3. Prometheus

Download and verify it:

```powershell
$ProgressPreference = 'SilentlyContinue'
$zip = "$env:TEMP\prometheus-3.14.0.windows-amd64.zip"
Invoke-WebRequest -UseBasicParsing https://github.com/prometheus/prometheus/releases/download/v3.14.0/prometheus-3.14.0.windows-amd64.zip -OutFile $zip
Invoke-WebRequest -UseBasicParsing https://github.com/prometheus/prometheus/releases/download/v3.14.0/sha256sums.txt -OutFile "$env:TEMP\prometheus-sha256sums.txt"
$expected = ((Get-Content "$env:TEMP\prometheus-sha256sums.txt" | Select-String 'windows-amd64.zip').Line -split '\s+')[0]
(Get-FileHash $zip -Algorithm SHA256).Hash -eq $expected.ToUpper()
```

Only continue if that printed `True`.

```powershell
Expand-Archive $zip -DestinationPath "C:\Program Files"
Rename-Item "C:\Program Files\prometheus-3.14.0.windows-amd64" Prometheus
& "C:\Program Files\Prometheus\promtool.exe" check config C:\Mirror-TS\monitoring\prometheus.yml
```

Prometheus runs as the built-in low-privilege `LocalService` account. It needs to read the config and write its data folder:

```powershell
New-Item -ItemType Directory C:\ProgramData\Prometheus\data -Force | Out-Null
icacls C:\ProgramData\Prometheus /grant "NT AUTHORITY\LocalService:(OI)(CI)M"
icacls C:\Mirror-TS\monitoring /grant "NT AUTHORITY\LocalService:(OI)(CI)RX"
```

Create the service. Use the NSSM copy in `C:\Program Files\NSSM`, because services can't run NSSM through winget's shortcut:

```powershell
$nssm = "C:\Program Files\NSSM\nssm.exe"
& $nssm install Prometheus "C:\Program Files\Prometheus\prometheus.exe"
& $nssm set Prometheus AppParameters "--config.file=C:\Mirror-TS\monitoring\prometheus.yml --storage.tsdb.path=C:\ProgramData\Prometheus\data --storage.tsdb.retention.time=30d --web.listen-address=127.0.0.1:9090"
& $nssm set Prometheus AppDirectory C:\ProgramData\Prometheus
& $nssm set Prometheus DisplayName "Prometheus (Mirror monitoring)"
& $nssm set Prometheus AppStdout C:\ProgramData\Prometheus\prometheus.log
& $nssm set Prometheus AppStderr C:\ProgramData\Prometheus\prometheus.log
Get-CimInstance Win32_Service -Filter "Name='Prometheus'" | Invoke-CimMethod -MethodName Change -Arguments @{ StartName = 'NT AUTHORITY\LocalService'; StartPassword = '' }
Start-Service Prometheus
```

Check it. Both jobs should show `up`:

```powershell
Start-Sleep 30; (Invoke-RestMethod http://127.0.0.1:9090/api/v1/targets).data.activeTargets | Select-Object @{ n = 'job'; e = { $_.labels.job } }, health, lastError
```

### 4. Grafana

```powershell
winget install -e --id GrafanaLabs.Grafana.OSS
Copy-Item C:\Mirror-TS\monitoring\grafana\custom.ini "C:\Program Files\GrafanaLabs\grafana\conf\custom.ini"
Restart-Service Grafana
```

Allow the dashboard only from the PC you'll view it on (here `192.168.68.59`). First list any Grafana firewall rules the installer created, and remove or disable any that allow other addresses:

```powershell
Get-NetFirewallRule | Where-Object DisplayName -match 'grafana' | Format-Table DisplayName, Enabled, Direction, Action
New-NetFirewallRule -DisplayName "Grafana - upstairs PC only" -Direction Inbound -Protocol TCP -LocalPort 3000 -RemoteAddress 192.168.68.59 -Action Allow -Profile Private
```

Then, on the viewing PC:
1. Open `http://192.168.68.55:3000`.
2. Sign in as `admin` / `admin`.
3. Set a strong new password when prompted.
4. Open **Dashboards → Mirror → Mirror bot**.

## Updating the dashboard

The dashboard and data source are loaded from `monitoring/grafana`, so a `git pull` updates them. Grafana picks up changes within a minute. Changes to `monitoring/prometheus.yml` need `Restart-Service Prometheus`.
