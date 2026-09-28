//Call: Slash command autojoin
//Turns on or off Mirror joining the server's default voice channel by itself when people are in it
import {
	ApplicationCommandOptionType,
	CacheType,
	ChatInputCommandInteraction,
	EmbedBuilder,
} from 'discord.js';
import { Bot } from '../Bot';
import { commandMention } from '../resources/cards';
import { colorCheck } from '../resources/embedColorCheck';
import { respond } from '../resources/respond';
import { autoJoin, autoJoinOn, defaultVc, inVoice, joinDefaultVoice } from './DefaultVc';
import { Option, Subcommand } from './Option';
import { SlashCommand } from './SlashCommand';

export class AutoJoin implements SlashCommand {
	name: string = 'autojoin';
	description: string =
		'[MANAGER] Turn on or off Mirror joining the default voice channel when people are in it';
	options: (Option | Subcommand)[] = [
		new Option(
			'state',
			'On or off. Leave it out to see the current setting',
			ApplicationCommandOptionType.String,
			false,
			undefined,
			[
				{ name: 'on', value: 'on' },
				{ name: 'off', value: 'off' },
			]
		),
	];
	requiredPermissions: bigint[] = [];
	async run(
		bot: Bot,
		interaction: ChatInputCommandInteraction<CacheType>
	): Promise<void> {
		try {
			const guild = interaction.guild!;
			const state = interaction.options.getString('state');
			const channelId = defaultVc.get(guild.id) as string | undefined;
			const where = channelId ? `<#${channelId}>` : 'the default voice channel';
			//without a default channel there is nowhere to join, whatever the setting
			const noDefault = channelId
				? ''
				: `\nNo default voice channel is set yet. Pick one with ${commandMention(bot, 'defaultvc')}.`;

			//no state given: just say how it's set
			if (!state) {
				const on = autoJoinOn(guild.id);
				return void (await respond(
					interaction,
					`Auto-join is **${on ? 'on' : 'off'}**: Mirror ${on ? 'joins' : "doesn't join"} ${where} by itself when people are in it.${noDefault}`
				));
			}

			const on = state === 'on';
			autoJoin.set(guild.id, on);
			const embed = new EmbedBuilder()
				.setColor(colorCheck(guild.id))
				.setDescription(
					on
						? `Auto-join is **on**. Mirror joins ${where} by itself when someone is in it, and leaves once it's empty.${noDefault}`
						: `Auto-join is **off**. Mirror won't join ${where} by itself anymore. Bring it in with ${commandMention(bot, 'join')}.`
				);
			await interaction.reply({ embeds: [embed] });
			//turned on while people are already in the channel
			if (on && !inVoice(bot, guild)) void joinDefaultVoice(bot, guild);
		} catch (err) {
			bot.logger.commandError(interaction.channelId, this.name, err);
			await respond(interaction, 'Error: contact a developer to investigate');
		}
	}
	guildRequired?: boolean = true;
	managerRequired?: boolean = true;
}
