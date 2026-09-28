//Call: $sendupdate followed by the update
//Posts a Mirror update to every server's update channel (set there with /update). Only the owner in
//config.json can use it
import { Message, EmbedBuilder } from 'discord.js';
import { Bot } from '../Bot';
import { MessageCommand } from './MessageCommand';
import config from '../resources/config';
import { handledHere } from '../resources/instanceGuard';
import { updateChannels } from '../slashcommands/Update';

//the most Discord allows in an embed's description
const maxLength = 4096;

//the update to send: what follows the command word in the same message (after a space or a new line,
//with its formatting kept), or else a .txt file attached to it, or else the message it replies to.
//a long paste arrives as an attached message.txt, and replying lets the update be read over first
async function updateText(message: Message): Promise<string> {
	const typed = message.content.replace(/^\S+\s*/, '').trim();
	if (typed) return typed;
	const file = message.attachments.find(
		(attachment) => attachment.name.toLowerCase().endsWith('.txt') || !!attachment.contentType?.startsWith('text/plain')
	);
	if (file) {
		const response = await fetch(file.url);
		if (response.ok) return (await response.text()).trim();
	}
	if (message.reference?.messageId) {
		const original = await message.fetchReference().catch(() => null);
		if (original) return original.content.trim();
	}
	return '';
}

export class SendUpdate implements MessageCommand {
	name: string = 'sendupdate';
	//the answer goes back to the owner as a reply, and each update channel is checked as it's posted to
	requiredPermissions: bigint[] = [];
	async run(
		bot: Bot,
		message: Message<boolean>,
		args: string[]
	): Promise<void> {
		if (message.author.id != config.owner) {
			return; //we dont need to respond because as far as anyone cares this command does not matter
		}
		const answer = (content: string) =>
			message.reply({ content, allowedMentions: { repliedUser: false } }).catch(() => {});
		try {
			const content = await updateText(message);
			bot.logger.debug(`$sendupdate got ${content.length} characters of update`);
			if (!content) {
				return void (await answer(
					[
						'There was no update to send. Any of these works:',
						'- `$sendupdate` followed by the update, in the same message (new lines and **formatting** are kept)',
						'- write the update as a normal message first, then reply to it with `$sendupdate`',
						'- `$sendupdate` with the update attached as a `.txt` file (Discord does this by itself when a long message is pasted)',
					].join('\n')
				));
			}
			if (content.length > maxLength) {
				return void (await answer(
					`That update is ${content.length} characters long, and Discord allows ${maxLength} in one. Shorten it and send it again.`
				));
			}
			let embed = new EmbedBuilder()
				.setColor('#FFFFFF')
				.setTitle(
					':mirror: **__Mirror Update!__** <:homies:863998146589360158>'
				)
				.setDescription(content)
				.setFooter({
					text: 'Ford, Fordle#0001',
					iconURL: 'https://imgur.com/pxkMn14.jpg',
				});

			let sent = 0;
			let gone = 0;
			const failed: string[] = [];
			for (const [guildId, channelId] of updateChannels.entries()) {
				//a test copy only posts in its own test server
				if (!handledHere(bot, String(guildId))) continue;
				const guild = bot.client.guilds.cache.get(String(guildId));
				//Mirror has left that server since it set an update channel
				if (!guild) {
					gone++;
					continue;
				}
				const channel = bot.client.channels.cache.get(String(channelId));
				if (!channel?.isSendable()) {
					failed.push(`${guild.name} (its update channel is gone)`);
					continue;
				}
				try {
					await channel.send({ embeds: [embed] });
					sent++;
				} catch (error) {
					failed.push(`${guild.name} (${error instanceof Error ? error.message : error})`);
				}
			}

			const lines = [`Sent the update to ${sent} server${sent == 1 ? '' : 's'}.`];
			if (failed.length) {
				//a reply can only be so long, so a long list is cut short
				const shown = failed.slice(0, 10).join(', ');
				const more = failed.length > 10 ? `, and ${failed.length - 10} more` : '';
				lines.push(`Couldn't post in ${failed.length}: ${shown}${more}.`);
			}
			if (gone) lines.push(`-# Skipped ${gone} server${gone == 1 ? '' : 's'} Mirror is no longer in.`);
			await answer(lines.join('\n'));
		} catch (err) {
			bot.logger.commandError(message.channelId, this.name, err);
			await answer('Error: contact a developer to investigate');
			return;
		}
	}
}
