<img align="left" width="auto" height="90" src="./docs/images/thumbnail128x128.png">

[![Join us on Discord](https://img.shields.io/discord/938519232155648011.svg?label=&logo=discord&logoColor=ffffff&color=7389D8&labelColor=6A7EC2)](https://discord.gg/uvdg2R5PAU)

[![MIT License](https://img.shields.io/badge/license-MIT-informational.svg)](./LICENSE)


# About Mirror

Mirror is a multi-purpose Discord bot which provides fun, immersive and informative features for your discord server at no cost.

Mirror is a for-fun personal project for learning programming and computer science concepts through TypeScript, node-js, GitHub, and the Discord API.

Mirror was created in 2021 by Ford and Phantasm, with contributions from Zac, Luke, Gavin and Marty.

Interested in adding Mirror to your server? Click [here](https://discord.com/api/oauth2/authorize?client_id=887766414923022377&permissions=139606649936&scope=bot%20applications.commands)

By adding or using Mirror you agree to our [Terms of Service](TERMS.md) and [Privacy Policy](PRIVACY.md).

## Essential Commands

### Introthemes

Set your introtheme with [`/intro`](src/slashcommands/Intro.ts) to play an audio clip every time you join a voice channel!

Paste a YouTube link into the 'video' field. The video can be up to 10 minutes long; Mirror keeps its first 5 seconds and plays those.

### Music Player

Mirror allows users to listen to songs and playlists from YouTube, Spotify, SoundCloud and Apple Music. Using [`/play`](src/slashcommands/Play.ts) or [`/playnext`](src/slashcommands/PlayNext.ts) you can search for songs or paste your own song or playlist and it will add it to the queue.

The Music functionality includes many commands:
 - [`/shuffle`](src/slashcommands/Shuffle.ts)
 - [`/loop`](src/slashcommands/Loop.ts)
 - [`/resume`](src/slashcommands/Resume.ts), [`/pause`](src/slashcommands/Pause.ts)
 - [`/queue`](src/slashcommands/Queue.ts), [`/clearqueue`](src/slashcommands/ClearQueue.ts)
 - [`/skip`](src/slashcommands/Skip.ts)
 - [`/nowplaying`](src/slashcommands/NowPlaying.ts)
 and more!

### Birthdays

Save your birthday with [`/birthday`](src/slashcommands/Birthday.ts) and Mirror will wish you a happy birthday in your server. Only the day and month are stored. [`/birthdaylist`](src/slashcommands/BirthdayList.ts) shows everyone's birthdays in the server, and managers choose the channel and time for the messages with [`/birthdayconfig`](src/slashcommands/BirthdayConfig.ts).

### Informative Commands

 - [`/weather`](src/slashcommands/Weather.ts) Current weather for a provided city.

 - [`/stock`](src/slashcommands/Stock.ts) Daily summaries for up to 5 provided tickers.

 - [`/nasa`](src/slashcommands/Nasa.ts) Display the NASA Astronomy Picture of the Day.

### Fun Commands

 - [`/roll`](src/slashcommands/Roll.ts) Roll dice for D&D, like `1d20+4`.
 - [`/poll`](src/slashcommands/Poll.ts) Create a poll with up to 10 options.
 - [`/nut`](src/slashcommands/Nut.ts) Add or remove a nut from the server's nut jar.
 - [`/kanye`](src/slashcommands/Kanye.ts), [`/kawaii`](src/slashcommands/Kawaii.ts), [`/tickle`](src/slashcommands/Tickle.ts), [`/sicko`](src/slashcommands/Sicko.ts) and more.

### Link Fixing

X/Twitter, Instagram and TikTok links arrive in Discord as bare text or an empty card. With [`/embedfix`](src/slashcommands/EmbedFix.ts) on, Mirror replies to one with the same post rewritten so it previews, and hides the empty embed on the original where it has Manage Messages. It is off until a manager turns it on, and it never deletes anyone's message.

Two things worth knowing before turning it on:

 - The rewritten link is **re-posted by Mirror, under Mirror's own name**. A link filter, automod rule or audit habit that watches what people post will not see it, so managers should account for Mirror itself in those lists.
 - The previews come from **small third-party sites** ([the rules are listed here](src/resources/fixerRules.ts)), not from X, Instagram or TikTok. Mirror only rewrites the text and posts it; Discord's crawler is what fetches the preview.

### Server Management

Commands marked `[MANAGER]` can only be used by server administrators and roles added with [`/managerrole`](src/slashcommands/ManagerRole.ts). Managers can:

 - Turn features on or off: [`/autojoin`](src/slashcommands/AutoJoin.ts), [`/embedfix`](src/slashcommands/EmbedFix.ts), [`/nsfw`](src/slashcommands/Nsfw.ts)
 - Stop a member or role from using intros, music and birthdays: [`/silencemember`](src/slashcommands/SilenceMember.ts), [`/silencerole`](src/slashcommands/SilenceRole.ts)
 - Remove someone's intro theme: [`/removeintro`](src/slashcommands/RemoveIntro.ts)
 - Set the embed color and update channel: [`/servercolor`](src/slashcommands/ServerColor.ts), [`/update`](src/slashcommands/Update.ts)

Use [`/config`](src/slashcommands/Config.ts) to see your server's current settings.

## Terms and Privacy

Using Mirror means following our [Terms of Service](TERMS.md), which also cover what server managers are responsible for.

Mirror reads messages so it can respond to commands, keywords and links, but it does not store them. It stores only what you give it, such as your birthday and intro theme, plus server settings. Read the full [Privacy Policy](PRIVACY.md) for details, including how to have your data removed.

## Contributing to Mirror

Mirror is a public project and as such you are welcome to contribute if you desire.

If you want to work on Mirror with the team reach out to one of us on discord and we will get you started.

For more information on formatting and installing the bot read below: 

[Contributing](docs/CONTRIBUTING.md)  
[Building the bot](docs/BUILDING.md)  
[APIs we use](docs/APIDOCUMENTATION.md)  
[Monitoring the bot](docs/MONITORING.md)  
[Development Server](https://discord.gg/BTVseHM)

## Acknowledgements

Big thank you to Phantasm for building Mirror's framework and being an incredible mentor through this process, answering every question I have, no matter how dumb.

[discord.js.org](https://discord.js.org) for providing an incredibly deep and interesting package.

Luke, Gavin, Marty and Leo for allowing me to teach them GitHub, discord and TypeScript.

The wonderful folks from DisCouch, Paris, Friends and MarcyPark for breaking the bot countless times, making it even stronger than before.
