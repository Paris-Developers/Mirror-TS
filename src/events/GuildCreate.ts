import { EventHandler } from './EventHandler';
import { Bot } from '../Bot';
import {
	Guild,
	MessageEmbed,
	TextChannel,
	Permissions,
	GuildChannel,
	NonThreadGuildBasedChannel,
} from 'discord.js';

export class GuildCreate implements EventHandler {
	eventName = 'guildCreate';
	async process(bot: Bot, guild: Guild): Promise<void> {
		let embed = new MessageEmbed()
			.setTitle('**:mirror: Mirror has arrived!**')
			.setDescription(
				'Thanks for inviting Mirror to your server! \n\n To get started with Mirror use **`/help`** for more information about commands and functionality\n\nUse **`/config`** to see what else you can do before Mirror is fully functional'
			)
			.setColor('#FFFFFF');
		if(guild.systemChannel){
			if(guild.systemChannel.permissionsFor(guild.me!).has('VIEW_CHANNEL') &&
			guild.systemChannel.permissionsFor(guild.me!).has('SEND_MESSAGES')){
				await guild.systemChannel.send({embeds: [embed]});
				return;
			}
		}
		let channelList = await guild.channels.fetch();
		for (let channel of channelList) {
			if (
				channel[1]!.permissionsFor(guild.me!).has('VIEW_CHANNEL') &&
				channel[1]!.permissionsFor(guild.me!).has('SEND_MESSAGES') &&
				channel[1]!.type == 'GUILD_TEXT'
			) {
				let newChannel = channel[1] as TextChannel;
				await newChannel.send({ embeds: [embed] });
				break;
			}
		}
		return;
	}
}
