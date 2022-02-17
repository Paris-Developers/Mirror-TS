//Call: Slash command rockcrafts
//Returns player data from rockcrafts' fluxcup api

import {
	ChatInputApplicationCommandData,
	CommandInteraction,
	CacheType,
	Message,
	User,
	MessageReaction,
	Permissions,
} from 'discord.js';
import { Bot } from '../Bot';
import { SlashCommand } from './SlashCommand';

//Temporary fxn will be removed later

export class Rockcrafts implements SlashCommand {
	name: string = 'rockcrafts';
	registerData: ChatInputApplicationCommandData = {
		name: this.name,
		description: 'Information about RockCrafts',
	};
	requiredPermissions: bigint[] = [
		Permissions.FLAGS.SEND_MESSAGES,
		Permissions.FLAGS.MANAGE_MESSAGES,
		Permissions.FLAGS.ADD_REACTIONS,
	];
	async run(
		bot: Bot,
		interaction: CommandInteraction<CacheType>
	): Promise<void> {
		let res = await fetch(`https://api.fluxcup.org/members`);
		let jsonData = await res.json();
		let lines: string[] = []; //create an array we can iterate through
		for (let user of jsonData) {
			lines.push(
				`[${lines.length + 1}]**__${user.discordtags[0]}:__** \n :shield: ${
					user.roleDivisons[0]
				} :crossed_swords: ${user.roleDivisons[1]} :syringe: ${
					user.roleDivisons[2]
				} \n`
			);
		}

		let lowerIndex = 0;
		let upperIndex = 5;
		let toPrint = '';
		for (let line of lines.slice(lowerIndex, upperIndex)) {
			toPrint += line;
		}
		let message = (await interaction.reply({
			content: toPrint,
			fetchReply: true,
		})) as Message; //fetch the reply and store it so we can react to it and use it in the collector
		await message.react('⏪');
		await message.react('⏩');
		const filter = (reaction: MessageReaction, user: User) => {
			return (
				['⏪', '⏩'].includes(reaction.emoji.name!) &&
				user.id === interaction.user.id
			); //if reaction emoji matches one of the two in this array + it was reacted by the interaction creator
		};

		const collector = message.createReactionCollector({ filter, time: 60000 });
		collector.on('collect', (reaction, user) => {
			if (reaction.emoji.name == '⏩') {
				lowerIndex += 5;
			} else if (reaction.emoji.name == '⏪') {
				lowerIndex -= 5;
			} else return;
			if (lowerIndex < 0) {
				lowerIndex = lines.length - (lines.length % 5); // set the last page to start at the length minus remainder, just in case we have a length not divisble by five
			}
			upperIndex = lowerIndex + 5;
			if (upperIndex > lines.length) upperIndex = lines.length; // dont go out of bounds
			if (lowerIndex >= lines.length) {
				//restart from the beginning if we run out of content
				lowerIndex = 0;
				upperIndex = 5;
			}
			let toPrint = '';
			for (let line of lines.slice(lowerIndex, upperIndex)) {
				toPrint += line;
			}
			message.edit(toPrint);
			reaction.users.remove(user.id); //remove the emoji so the user doesn't have to remove it themselves
		});

		return;
	}
}
