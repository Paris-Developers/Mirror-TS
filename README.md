<img align="left" width="auto" height="90" src="./docs/images/thumbnail128x128.png">

[![Join us on Discord](https://img.shields.io/discord/938519232155648011.svg?label=&logo=discord&logoColor=ffffff&color=7389D8&labelColor=6A7EC2)](https://discord.gg/uvdg2R5PAU)

[![MIT License](https://img.shields.io/badge/license-MIT-informational.svg)](./LICENSE)


# About Mirror

Mirror is a multi-purpose Discord bot which provides fun, immersive and informative features for your discord server at no cost.

Mirror is a for fun personal project for learning programming and computer science concepts through TypeScript, GitHub, and the Discord API.

Mirror was created by Fordle#0001 and Phantasm#0001, with contributions from friends.

## Essential Commands

### Introthemes

Set your introtheme with [`/intro`](src/slashcommands/Intro.ts) to play an audio clip every time you join the chat channel!

Find a YouTube video shorter than 10 seconds and paste the link into 'video' field.

### Music Player

Mirror allows users to listen to songs and playlists from Spotify, YouTube, and Soundcloud.  Using [`/play`](src/slashcommands/Play.ts) or [`/playnext`](src/slashcommands/PlayNext.ts) you can search for songs or paste your own song or playlist and it will add it to the queue.

The Music functionality includes many commands:
 - [`/shuffle`](src/slashcommands/Shuffle.ts)
 - [`/loop`](src/slashcommands/Loop.ts)
 - [`/resume`](src/slashcommands/Resume.ts), [`/pause`](src/slashcommands/Pause.ts)
 - [`/queue`](src/slashcommands/Queue.ts), [`/clearqueue`](src/slashcommands/ClearQueue.ts)
 - [`/skip`](src/slashcommands/Skip.ts)
 and more!
 
### Informative Commands

 - [`/weather`](src/slashcommands/Weather.ts) Current weather for a provided city.

 - [`/stock`](src/slashcommands/Stock.ts) Daily summaries for up to 10 provided tickers.

 - [`/nasa`](src/slashcommands/Nasa.ts) Display the NASA Astronomy Picture of the Day.

## Contributing to Mirror

Mirror is a public project and as such you are welcome to contribute if you desire.

If you want to work on Mirror with the team reach out to one of us on discord and we will get you started.

For more information on formatting and installing the bot read below: 

[Contributing](docs/CONTRIBUTING.md)  
[Building the bot](docs/BUILDING.md)  
[APIs we use](docs/APIDOCUMENTATION.md)

## Acknowledgements

Big thank you to Phantasm for building Mirror's framework and being an incredible mentor through this process, answering every question I have, no matter how dumb.

[discord.js.org](https://discord.js.org) for providing an incredibly deep and interesting package.

Luke, Gavin, Marty and Leo for allowing me to teach them GitHub, discord and TypeScript.

The wonderful folks from DisCouch, Paris, Friends and MarcyPark for breaking the bot countless times, making it even stronger than before.
