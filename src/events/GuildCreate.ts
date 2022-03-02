import { EventHandler } from './EventHandler';
import { Bot } from '../Bot';
import { Guild, MessageEmbed, TextChannel, Permissions } from 'discord.js';
import { permissionsCheck } from '../resources/permissionsCheck';

export class GuildCreate implements EventHandler {
	eventName = 'guildCreate';
	async process(bot: Bot, guild: Guild): Promise<void> {
		//Check Guild for channels
		let channelList = await guild.channels.fetch();
        for(let chan of channelList){
            if (chan == TextChannel) {
        }
		(await channelList).forEach(async (channel) => {
			if (channel.type == 'GUILD_TEXT') {
				await channel.send('test');
			}
		});

		//Find the first channel where discord can send embeds and messages

		//send "welcome embed"

		//if they do not have perms to embed, send plain text
	}
}
