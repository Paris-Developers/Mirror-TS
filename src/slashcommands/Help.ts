//Call: Slash command help
//Returns the info command
import {
	ChatInputApplicationCommandData,
	CommandInteraction,
	Message,
	MessageEmbed,
	MessageReaction,
	Permissions,
	User,
} from 'discord.js';
import { Bot } from '../Bot';
import { SlashCommand } from './SlashCommand';

export class Help implements SlashCommand {
	name: string = 'help';
	registerData: ChatInputApplicationCommandData = {
		name: this.name,
		description: 'Information about the bot.',
	};
	requiredPermissions: bigint[] = [
		Permissions.FLAGS.SEND_MESSAGES,
		Permissions.FLAGS.EMBED_LINKS,
	];
	async run(bot: Bot, interaction: CommandInteraction): Promise<boolean> {
		//TODO: Add permission checks
		const page1 = new MessageEmbed()
			.setColor('#FFFFFF')
			.setTitle(':mirror: **__Mirror__**')
			.setDescription('Discord utility bot created by Ford, Zac, and Marty')
			.addFields(
				{
					name: '__Support server:__',
					value:
						'Interested in contributing or learning about development? Join our [dev server](https://discord.gg/uvdg2R5PAU)',
					inline: false,
				},
				{
					name: '__Command List:__',
					value:
						'**Page 1:** Voice Commands\n**Page 2:** Informative Commands\n**Page 3:** Other Commands',
					inline: false,
				}
			)
			.setFooter({ text: 'Page 1 of 4' });
		const page2 = new MessageEmbed()
			.setColor('#FFFFFF')
			.setTitle(':sound: **__Voice Commands__**')
			.setDescription(
				'/join: Have Mirror join the current voice call.\n' +
					'/leave: Have Mirror leave the current voice call.\n' +
					'/intro: Have Mirror set a specified youtube video as your intro theme.\n' +
					'/banintro: Allows an administrator to remove a specified users intro.\n' +
					'/sicko: :skull:'
			)
			.setFooter({ text: 'Page 2 of 4' });
		const page3 = new MessageEmbed()
			.setColor('#FFFFFF')
			.setTitle(':newspaper: **__Informative Commands__**')
			.setDescription(
				'/weather: Displays the current weather for a specified city. \n' +
					'/stock: Displays daily reports for up to 10 specified stocks. \n' +
					'/nasa: Sends the Nasa Astrology Picture of the Day.\n' +
					'/news: WIP.\n' +
					'/github: Links the open source code for Mirror'
			)
			.setFooter({ text: 'Page 3 of 4' });
		const page4 = new MessageEmbed()
			.setColor('#FFFFFF')
			.setTitle(':bell: **__Other Commands__**')
			.setDescription(
				'/poll: Create a timed poll with up to 10 options  \n' +
					'/kanye: Sends a random kanye quote\n' +
					'/kawaii: Sends a cute catgirl.\n' +
					'/birthday: Set your birthdayfor a message on your special day. \n' +
					'/mirror: :mirror:'
			)
			.setFooter({ text: 'Page 4 of 4' });
		// const page5 = new MessageEmbed()
		//     .setColor('#FFFFFF');
		//     //.setTitle()s
		//     //.setThumbnail()
		//     //.setTimestamp()
		//     //.setDescription()
		//     //.addField()
		//     //.setFooter();
		let embedArray = [page1, page2, page3, page4];
		let index = 0;
		let message = (await interaction.reply({
			embeds: [embedArray[index]],
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
				index += 1;
			} else if (reaction.emoji.name == '⏪') {
				index -= 1;
			} else return;
			if (index > embedArray.length - 1) {
				index = 0;
			} else if (index < 0) {
				index = embedArray.length - 1;
			}
			message.edit({ embeds: [embedArray[index]] });
			reaction.users.remove(user.id); //remove the emoji so the user doesn't have to remove it themselves
		});
		return true;
	}
}
