import { EventHandler } from './EventHandler';
import { Bot } from '../Bot';
import {
	Guild,
	MessageEmbed,
	TextChannel,
	Permissions,
	GuildChannel,
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
		//Check Guild for channels
		let channelList = await guild.channels.fetch();
		(await channelList).forEach(async (channel) => {
			if (channel.permissionsFor(guild.me!).has('SEND_MESSAGES')) {
				console.log('New guild test');
				let newChannel = channel as TextChannel;
				return await newChannel.send({ embeds: [embed] });
			}
		});
	}
}
