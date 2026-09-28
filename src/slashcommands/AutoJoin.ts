//Call: Slash command autojoin
//Opens a small settings card, just for the manager who ran it, to turn Mirror joining voice by
//itself on or off for the server
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	CacheType,
	ChatInputCommandInteraction,
	ContainerBuilder,
	Guild,
	MessageFlags,
} from 'discord.js';
import { Bot } from '../Bot';
import { autoJoin, autoJoinOn, inVoice, joinPeople } from '../resources/autoJoin';
import { accentColor, addHeading, commandMention, divider, handleControls } from '../resources/cards';
import { respond } from '../resources/respond';
import { Option, Subcommand } from './Option';
import { SlashCommand } from './SlashCommand';

export class AutoJoin implements SlashCommand {
	name: string = 'autojoin';
	description: string = '[MANAGER] Choose whether Mirror joins voice by itself when people are in a channel';
	options: (Option | Subcommand)[] = [];
	requiredPermissions: bigint[] = [];
	async run(
		bot: Bot,
		interaction: ChatInputCommandInteraction<CacheType>
	): Promise<void> {
		try {
			const guild = interaction.guild!;
			const render = (controls: boolean, note?: string) => autoJoinCard(bot, guild, controls, note);
			//only the manager who opened it sees the card
			const response = await interaction.reply({
				components: [render(true)],
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
				allowedMentions: { parse: [] },
				withResponse: true,
			});
			const message = response.resource?.message;
			if (!message) return;

			handleControls(
				bot,
				message,
				interaction.user.id,
				async (control) => {
					if (!control.isButton()) return;
					const on = control.customId === 'autojoin:on';
					autoJoin.set(guild.id, on);
					bot.logger.info(`[${guild.name}] ${interaction.user.tag} turned auto-join ${on ? 'on' : 'off'}`);
					await control.update({
						components: [render(true, on ? '✅ Turned on' : '⏹️ Turned off')],
						allowedMentions: { parse: [] },
					});
					//turned on while people are already in voice: Mirror joins them now
					if (on && !inVoice(bot, guild)) void joinPeople(bot, guild);
				},
				() => interaction.editReply({ components: [render(false)], allowedMentions: { parse: [] } })
			);
		} catch (err) {
			bot.logger.commandError(interaction.channelId, this.name, err);
			await respond(interaction, 'Error: contact a developer to investigate');
		}
	}
	guildRequired?: boolean = true;
	managerRequired?: boolean = true;
}

function autoJoinCard(bot: Bot, guild: Guild, controls: boolean, note?: string): ContainerBuilder {
	const on = autoJoinOn(guild.id);
	const card = new ContainerBuilder().setAccentColor(accentColor(guild.id));
	addHeading(
		card,
		`## 🔊 Auto-join\nWhether Mirror joins voice in **${guild.name}** by itself, so nobody has to type ${commandMention(bot, 'join')}.`,
		guild.iconURL()
	);
	card.addSeparatorComponents(divider);
	card.addTextDisplayComponents((text) =>
		text.setContent(
			[
				`### ${on ? '🟢 On' : '⚪ Off'}${note ? ` · ${note}` : ''}`,
				on
					? 'Mirror follows the first person into a voice channel, and they hear their intro.'
					: `Mirror only joins voice when someone uses ${commandMention(bot, 'join')} or ${commandMention(bot, 'play')}.`,
				'',
				'**Either way**',
				"- Mirror leaves a channel once it's been empty for 30 seconds, so a channel never looks busy with only Mirror in it.",
				`- ${commandMention(bot, 'leave')} sends Mirror away until everyone has left voice.`,
			].join('\n')
		)
	);
	if (!controls) {
		card.addTextDisplayComponents((text) => text.setContent(`-# Run ${commandMention(bot, 'autojoin')} again to change it.`));
		return card;
	}
	card.addSeparatorComponents(divider);
	card.addActionRowComponents(
		new ActionRowBuilder<ButtonBuilder>().addComponents(
			on
				? new ButtonBuilder().setCustomId('autojoin:off').setLabel('Turn off').setStyle(ButtonStyle.Secondary)
				: new ButtonBuilder().setCustomId('autojoin:on').setLabel('Turn on').setStyle(ButtonStyle.Success)
		)
	);
	card.addTextDisplayComponents((text) => text.setContent('-# Only you can see this. Managers and admins can change it.'));
	return card;
}
