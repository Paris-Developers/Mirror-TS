import { Message, Permissions, MessageEmbed, TextChannel } from 'discord.js';
import { Bot } from '../Bot';
import { MessageCommand } from './MessageCommand';
import config from '../../config.json';
import { updateChannels } from '../slashcommands/Update';

export class SendUpdate implements MessageCommand {
	name: string = 'sendupdate';
	requiredPermissions: bigint[] = [Permissions.FLAGS.SEND_MESSAGES];
	async run(
		bot: Bot,
		message: Message<boolean>,
		args: string[]
	): Promise<void> {
		try {
			let user = message.author;
			if (user.id != config.owner) {
				return; //we dont need to respond because as far as anyone cares this command does not matter
			}
			let content = message.content.slice(12); //cuts out "$sendupdate "
			let embed = new MessageEmbed()
				.setColor('#FFFFFF')
				.setTitle(
					':mirror: **__Mirror Update!__** <:homies:863998146589360158>'
				)
				.setDescription(content)
				.setFooter({
					text: 'Ford, Fordle#0001',
					iconURL: 'https://imgur.com/pxkMn14.jpg',
				});
			updateChannels.forEach(async (channel) => {
				let channelToUpdate = bot.client.channels!.cache.get(
					channel.toString()
				) as TextChannel;
				if (!channelToUpdate) return;
				await channelToUpdate.send({ embeds: [embed] });
			});
		} catch (err) {
			bot.logger.error(message.channel!.id, this.name, err);
			message.reply({
				content: 'Error: contact a developer to investigate',
			});
			return;
		}
	}
}
