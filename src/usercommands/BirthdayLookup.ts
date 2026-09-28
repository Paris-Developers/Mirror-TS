//Call: right-click a person, then Apps, then Birthday
//Shows the birthday that person saved, in a reply only the person who asked can see
import { MessageFlags, UserContextMenuCommandInteraction } from 'discord.js';
import { Bot } from '../Bot';
import { daysAway, longDate, savedBirthday } from '../resources/birthdayDates';
import { commandMention } from '../resources/cards';
import { UserCommand } from './UserCommand';

export class BirthdayLookup implements UserCommand {
	name: string = 'Birthday';
	blockSilenced?: boolean | undefined = true;
	async run(bot: Bot, interaction: UserContextMenuCommandInteraction): Promise<void> {
		try {
			const target = interaction.targetUser;
			const themselves = target.id === interaction.user.id;
			const birthday = savedBirthday(target.id);

			let content: string;
			if (birthday) {
				const whose = themselves ? 'Your birthday' : `${target}'s birthday`;
				content = `🎂 ${whose} is **${longDate(birthday)}** · ${daysAway(birthday)}`;
			} else if (themselves) {
				content = `You haven't saved a birthday yet. Add yours with ${commandMention(bot, 'birthday')}.`;
			} else if (target.bot) {
				content = `🤖 ${target} is a bot, and bots don't have birthdays.`;
			} else {
				content = `${target} hasn't saved a birthday. They can add theirs with ${commandMention(
					bot,
					'birthday'
				)}.`;
			}

			await interaction.reply({
				content,
				flags: MessageFlags.Ephemeral,
				allowedMentions: { parse: [] },
			});
		} catch (err) {
			bot.logger.commandError(interaction.channelId ?? '', this.name, err);
			if (interaction.replied || interaction.deferred) return;
			interaction.reply({
				content: 'Error: contact a developer to investigate',
				flags: MessageFlags.Ephemeral,
			});
		}
	}
}
