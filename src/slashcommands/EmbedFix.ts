//Call: Slash command embedfix
//Opens a small settings card, just for the manager who ran it, to turn link fixing on or off for the
//server
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
import { accentColor, addHeading, commandMention, divider, handleControls } from '../resources/cards';
import { embedFix, embedFixOn } from '../resources/embedFix';
import { respond } from '../resources/respond';
import { Option, Subcommand } from './Option';
import { SlashCommand } from './SlashCommand';

export class EmbedFix implements SlashCommand {
	name: string = 'embedfix';
	description: string = '[MANAGER] Choose whether Mirror re-posts links that Discord will not preview';
	options: (Option | Subcommand)[] = [];
	requiredPermissions: bigint[] = [];
	async run(bot: Bot, interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
		try {
			const guild = interaction.guild!;
			const render = (controls: boolean, note?: string) => embedFixCard(bot, guild, controls, note);
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
					const on = control.customId === 'embedfix:on';
					embedFix.set(guild.id, on);
					bot.logger.info(`[${guild.name}] ${interaction.user.tag} turned link fixing ${on ? 'on' : 'off'}`);
					await control.update({
						components: [render(true, on ? '✅ Turned on' : '⏹️ Turned off')],
						allowedMentions: { parse: [] },
					});
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

function embedFixCard(bot: Bot, guild: Guild, controls: boolean, note?: string): ContainerBuilder {
	const on = embedFixOn(guild.id);
	const card = new ContainerBuilder().setAccentColor(accentColor(guild.id));
	addHeading(
		card,
		`## 🔗 Link fixing\nWhether Mirror answers links in **${guild.name}** that Discord shows as bare text instead of a preview.`,
		guild.iconURL()
	);
	card.addSeparatorComponents(divider);
	card.addTextDisplayComponents((text) =>
		text.setContent(
			[
				`### ${on ? '🟢 On' : '⚪ Off'}${note ? ` · ${note}` : ''}`,
				on
					? 'Mirror replies to an X, Instagram or TikTok link with the same post in a form that previews, and hides the empty embed on the original where it can.'
					: 'X, Instagram and TikTok links are left exactly as posted.',
				'',
				'**Worth knowing**',
				'- The reply is posted by Mirror, under its own name, so a link filter set up for people will not see it.',
				'- The previews come from small third-party sites, not from X, Instagram or TikTok.',
				'- At most two links per message, and three fixes per channel every 30 seconds.',
				`- Mirror needs Manage Messages here to hide the empty embed. ${commandMention(bot, 'config')} shows what it has.`,
			].join('\n')
		)
	);
	if (!controls) {
		card.addTextDisplayComponents((text) =>
			text.setContent(`-# Run ${commandMention(bot, 'embedfix')} again to change it.`)
		);
		return card;
	}
	card.addSeparatorComponents(divider);
	card.addActionRowComponents(
		new ActionRowBuilder<ButtonBuilder>().addComponents(
			on
				? new ButtonBuilder().setCustomId('embedfix:off').setLabel('Turn off').setStyle(ButtonStyle.Secondary)
				: new ButtonBuilder().setCustomId('embedfix:on').setLabel('Turn on').setStyle(ButtonStyle.Success)
		)
	);
	card.addTextDisplayComponents((text) =>
		text.setContent('-# Only you can see this. Managers and admins can change it.')
	);
	return card;
}
