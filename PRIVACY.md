# Mirror Privacy Policy

_Last updated: October 13, 2026_

Mirror is a free, open source Discord bot run by its developers as a hobby project. This policy explains what information Mirror reads, what it keeps, and how you can have it removed. Mirror's code is public on [GitHub](https://github.com/Paris-Developers/Mirror-TS), so you can check anything described here.

By adding Mirror to a server or using its commands, you agree to this policy.

## What Mirror reads but does not keep

**Messages.** Mirror reads messages in the channels it can see. This lets it respond to `$` commands and keywords, and (in servers that turn on `/embedfix`) repost X/Twitter, Instagram and TikTok links in a form that previews properly in Discord. Mirror does not store message contents. To stop Mirror from reading messages, remove its permission to view a channel, or reinvite it without the "Read Messages" permission.

**Voice channels.** Mirror only listens for when people join and leave voice channels, so it can play intro themes and join on its own when a server turns on `/autojoin`. Mirror does not record or listen to anyone's voice.

**Command input.** Whatever you type into a command (a song search, a city, a stock ticker) is used to answer that command and is not kept, except for the commands listed below.

## What Mirror stores

Mirror keeps the following on the machine it runs on. Users and servers are identified by their Discord IDs.

| What | When it's stored | Who can see it |
|---|---|---|
| Your birthday (day and month only, no year) | You use `/birthday` | Members of any server you share with Mirror, through `/birthdaylist` and birthday announcements |
| Your intro theme: a 5 second audio clip taken from a YouTube video you choose | You use `/intro` | Anyone in a voice channel when you join it |
| Your count in the nut jar | Someone uses `/nut` | Members of the server |
| Whether you've been silenced from using Mirror in a server | A server manager uses `/silencemember` | Server managers |
| Server settings: manager roles, silenced role, embed color, birthday channel and time, update channel, and on/off settings for auto join, embed fix and NSFW content | A server manager changes a setting | Server managers |

Mirror also keeps:

- **Logs**, which record errors and what the bot is doing. Logs can include server, channel and user IDs and the names of commands that were used. When a command fails, a short error report, including the channel it happened in, is posted to a private channel that only the developers can see.
- **Usage statistics**, such as how many times each command is used in each server and how many servers Mirror is in. These are used to keep the bot running well and do not include message contents.

Only Mirror's developers can access stored data and logs. Mirror does not sell your data, show ads, or share your data with anyone except as described below.

## Services Mirror uses

Some commands need information from other services. When you use them, Mirror sends that service only what the command needs:

- **Discord**: Mirror runs on Discord, and everything you do with it goes through Discord. See [Discord's Privacy Policy](https://discord.com/privacy).
- **YouTube and other music sources**: your search or link, when you use `/play`, `/playnext` or `/intro`.
- **OpenWeatherMap**: the city you search for, when you use `/weather`.
- **Finnhub**: the stock tickers you enter, when you use `/stock`.
- **NASA, kanye.rest and nekos.best**: requests for pictures and quotes. No information about you is sent.
- **FxTwitter, 67instagram and tnktok**: when embed fix reposts a link, Discord loads its preview from these sites. Mirror doesn't contact them itself.

Each service has its own privacy policy.

## Removing your data

- Server managers can remove someone's intro theme with `/removeintro` and change any server setting at any time.
- Removing Mirror from a server stops it from reading anything in that server.
- To have your birthday, intro theme, or anything else Mirror stores about you deleted, ask in our [support server](https://discord.gg/uvdg2R5PAU) and a developer will remove it.

## Children

Mirror is meant for people old enough to use Discord under [Discord's Terms of Service](https://discord.com/terms).

## Changes to this policy

If this policy changes, the new version will be posted here with a new "Last updated" date.

## Contact

Questions? Join the [Mirror support server](https://discord.gg/uvdg2R5PAU).
