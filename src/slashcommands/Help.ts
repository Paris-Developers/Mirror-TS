//Call: Slash command help
//Returns the info command
import {
	ChatInputApplicationCommandData,
	CommandInteraction,
	CommandOptionChannelResolvableType,
	Message,
	MessageEmbed,
	MessageReaction,
	Permissions,
	User,
} from 'discord.js';
import { Bot } from '../Bot';
import { colorCheck } from '../resources/embedColorCheck';
import { SlashCommand } from './SlashCommand';

export class Help implements SlashCommand {
	name: string = 'help';
	description: string = 'Information about the bot';
	options = [];
	requiredPermissions: bigint[] = [
		Permissions.FLAGS.SEND_MESSAGES,
		Permissions.FLAGS.EMBED_LINKS, 
		Permissions.FLAGS.MANAGE_MESSAGES,
		Permissions.FLAGS.ADD_REACTIONS,
	];
	async run(bot: Bot, interaction: CommandInteraction): Promise<void> {
		try {
			type cmdList = {[index:string]: string};
			let cmds = {} as cmdList;
			bot.slashCommands.forEach((command)=>{
				cmds[command.name] = command.description;
			})
			const page1 = new MessageEmbed()
				.setColor(colorCheck(interaction.guild!.id))
				.setTitle(':mirror: **__Mirror__**')
				.setDescription('Informational and fun discord bot created by Ford, Zac, and Marty')
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
							'**Page 2:** Voice Commands\n' +
							'**Page 3:** Informative and Fun Commands\n' +
							'**Page 4:** Server Configuration Guide\n' +
							'**Page 5:** More Information',
						inline: false,
					}
				)
				.setFooter({ text: 'Page 1 of 5' });
			const page2 = new MessageEmbed()
				.setColor(colorCheck(interaction.guild!.id))
				.setTitle(':sound: **__Voice Commands__**')
				.setDescription(
					`\`/join\`  ${cmds.join}\n` +
					`\`/leave\`  ${cmds.leave}\n` + 
					`\`/default\`  ${cmds.defaultvc}\n`
				)
				.addFields({
					name: 'Introtheme Commands',
					value: `\`/intro\`  ${cmds.intro}\n` +
					`\`/banIntro\`  ${cmds.banIntro}\n`,
					inline: false	
				},{
					name: 'Music Commands',
					value: `\`/play\`  ${cmds.play}\n` +
					`\`/playnext\`  ${cmds.playnext}\n` +
					`\`/nowplaying\`  ${cmds.nowplaying}\n` +
					`\`/queue\`  ${cmds.queue}\n` +
					`\`/clearqueue\`  ${cmds.clearqueue}\n` +
					`\`/shuffle\`  ${cmds.shuffle}\n` +
					`\`/pause\`  ${cmds.pause}\n` +
					`\`/resume\`  ${cmds.resume}\n` +
					`\`/destroyqueue\`  ${cmds.destroyqueue}\n` +
					`\`/sicko\`  ${cmds.sicko}\n`,
					inline:false
				})
				.setFooter({ text: 'Page 2 of 5' });
			const page3 = new MessageEmbed()
				.setColor(colorCheck(interaction.guild!.id))
				.addFields({
					name: 'Informative Commands',
					value: `\`/weather\`  ${cmds.weather}\n` +
					`\`/stock\`  ${cmds.stock}\n` +
					`\`/nasa\`  ${cmds.nasa}\n` +
					`\`/github\`  ${cmds.github}\n`,
				},{
					name: 'Fun Commands',
					value: `\`/birthday\`  ${cmds.birthday}\n` +
					`\`/kanye\`  ${cmds.kanye}\n` +
					`\`/poll\`  ${cmds.poll}\n` +
					`\`/kawaii\`  ${cmds.kawaii}\n` +
					`\`/tickle\`  ${cmds.tickle}\n` +
					`\`/mirror\`  ${cmds.mirror}\n` +
					`\`/boey\`  ${cmds.boey}\n` +
					`\`/nut\`  ${cmds.nut}\n` +
					`\`/roll\`  ${cmds.roll}\n`
				})
				.setFooter({ text: 'Page 3 of 5' });
			const page4 = new MessageEmbed()
				.setColor(colorCheck(interaction.guild!.id))
				.setTitle(':bell: **__Server Configuration__**')
				.setDescription(
					`\`/config\`  ${cmds.config}\n` +
					`\`/defaultvc\`  ${cmds.defaultvc}\n` +
					`\`/update\`  ${cmds.update}\n` +
					`\`/birthdayconfig\`  ${cmds.birthdayconfig}\n` +
					`\`/managerrole\`  ${cmds.managerrole}\n` +
					`\`/silencemember\`  ${cmds.silencemember}\n` +
					`\`/silencerole\`  ${cmds.silencerole}\n` + 
					`\`/destroyqueue\`  ${cmds.destroyqueue}\n` +
					`\`/nsfw\`  ${cmds.nsfw}\n` +
					`\`/removeintro\`  ${cmds.removeintro}\n`
				)
				.setFooter({ text: 'Page 4 of 5' });
			const page5 = new MessageEmbed()
			.setColor(colorCheck(interaction.guild!.id))
			.setTitle(':bell: **__Other Information__**')
			.addFields({
				name: 'Commands',
				value: `\`/github\`  ${cmds.github}\n` +
				`\`/invite\`  ${cmds.invite}\n` +
				`\`/support\`  ${cmds.support}\n` +
				`\`/test\`  ${cmds.test}\n`
			},{
				name: 'Thanks You!',
				value: 'Thank you for using Mirror! On behalf of the developer team we appreciate you taking time to learn and improve our bot.  If you have any questions regarding Mirror, reach out to us using our [Support Server](https://discord.gg/uvdg2R5PAU)'
			})
			.setFooter({ text: 'Page 5 of 5' });
			let embedArray = [page1, page2, page3, page4, page5];
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
			const collector = message.createReactionCollector({
				filter,
				time: 60000,
			});
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
		} catch (err) {
			bot.logger.commandError(interaction.channel!.id, this.name, err);
			interaction.reply({
				content: 'Error: contact a developer to investigate',
				ephemeral: true,
			});
			return;
		}
	}
}
