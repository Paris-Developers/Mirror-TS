import { EventHandler } from './EventHandler';
import { Bot } from '../Bot';
import {
	Guild,
	EmbedBuilder,
	TextChannel,
	Permissions,
	GuildChannel,
	NonThreadGuildBasedChannel,
	BaseGuildTextChannel,
	ChannelType,
} from 'discord.js';

export class GuildCreate implements EventHandler {
	eventName = 'guildCreate';
	async process(bot: Bot, guild: Guild): Promise<void> {
		let embed = new EmbedBuilder()
			.setTitle('**:mirror: Mirror has arrived!**')
			.setDescription(
				'Thanks for inviting Mirror to your server! \n\n To get started with Mirror use **`/help`** for more information about commands and functionality\n\nUse **`/config`** to see what else you can do before Mirror is fully functional'
			)
			.setColor('#FFFFFF');
		if(guild.systemChannel){
			if(guild.systemChannel.permissionsFor(guild.members.me!).has('ViewChannel') &&
			guild.systemChannel.permissionsFor(guild.members.me!).has('SendMessages')){
				await guild.systemChannel.send({embeds: [embed]});
				return;
			}
		}
		let channelList = await guild.channels.fetch();
		for (let channel of channelList) {
			if (
				channel[1]!.permissionsFor(guild.members.me!).has('ViewChannel') &&
				channel[1]!.permissionsFor(guild.members.me!).has('SendMessages') &&
				channel[1]!.type == ChannelType.GuildText
			) {
				let newChannel = channel[1] as TextChannel;
				await newChannel.send({ embeds: [embed] });
				break;
			}
		}
		return;
	}
}
