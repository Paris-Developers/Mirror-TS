import {
	CacheType,
	ChatInputCommandInteraction,
	ContainerBuilder,
	GuildChannel,
	MessageFlags,
	PermissionFlagsBits,
	escapeMarkdown,
} from 'discord.js';
import { Bot } from '../Bot';
import { SlashCommand } from './SlashCommand';
import { bdayChannels, bdayTimes } from './BirthdayConfig';
import { defaultVc } from './DefaultVc';
import { updateChannels } from './Update';
import { nsfw } from './Nsfw';
import { managerRoles } from './ManagerRole';
import { silencedRole } from './SilenceRole';
import { silencedUsers } from './SilenceMember';
import { serverColors } from './ServerColor';
import { accentColor, addHeading, cardReply, commandMention, divider } from '../resources/cards';

//what Mirror needs in a channel for all of its commands to work there
const neededPermissions: [string, bigint][] = [
	['View Channel', PermissionFlagsBits.ViewChannel],
	['Send Messages', PermissionFlagsBits.SendMessages],
	['Embed Links', PermissionFlagsBits.EmbedLinks],
	['Add Reactions', PermissionFlagsBits.AddReactions],
	['Use External Emojis', PermissionFlagsBits.UseExternalEmojis],
	['Manage Messages', PermissionFlagsBits.ManageMessages],
	['Connect', PermissionFlagsBits.Connect],
	['Speak', PermissionFlagsBits.Speak],
	['Move Members', PermissionFlagsBits.MoveMembers],
	['Deafen Members', PermissionFlagsBits.DeafenMembers],
];

export class Config implements SlashCommand {
	name: string = 'config';
	description = 'See the configuration settings for this server';
	options = [];
	requiredPermissions: bigint[] = [PermissionFlagsBits.SendMessages];
	async run(bot: Bot, interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
		try {
			const guild = interaction.guild!;
			const channelName = (id: unknown) =>
				typeof id === 'string' && guild.channels.cache.has(id) ? `<#${id}>` : 'a channel that no longer exists';
			const setting = (label: string, value: string | undefined, command: string) =>
				value
					? `✅ **${label}** · ${value}`
					: `❌ **${label}** · not set up · ${commandMention(bot, command)}`;

			//birthday times are saved as MM-HH-DATEMOD-TIMEZONE
			const birthdayChannel = bdayChannels.get(guild.id);
			const [minute, hour, , timezone] = String(bdayTimes.get(guild.id) ?? '').split('-');
			const birthdayTime =
				minute && hour && timezone
					? ` at ${hour.padStart(2, '0')}:${minute.padStart(2, '0')} ${timezone.toUpperCase()}`
					: '';
			const nsfwOn = nsfw.get(guild.id) == 'on';
			const color = serverColors.get(guild.id);

			const features = [
				setting('Birthday messages', birthdayChannel && `${channelName(birthdayChannel)}${birthdayTime}`, 'birthdayconfig'),
				setting('Default voice channel', defaultVc.get(guild.id) && channelName(defaultVc.get(guild.id)), 'defaultvc'),
				setting('Mirror development updates', updateChannels.get(guild.id) && channelName(updateChannels.get(guild.id)), 'update'),
				`${nsfwOn ? '✅' : '❌'} **NSFW commands** · ${nsfwOn ? 'on' : 'off'} · ${commandMention(bot, 'nsfw')}`,
				`🎨 **Color** · ${color ? `\`${color}\`` : 'default'} · ${commandMention(bot, 'servercolor')}`,
			];

			const managers = (managerRoles.ensure(guild.id, []) as string[])
				.filter((role) => guild.roles.cache.has(role))
				.map((role) => `<@&${role}>`);
			const silenced = silencedRole.get(guild.id);
			const silencedMembers = (silencedUsers.ensure(guild.id, []) as string[]).length;
			const roles = [
				`**Mirror managers** · ${managers.length ? managers.join(', ') : `none yet · ${commandMention(bot, 'managerrole')}`}`,
				`**Silenced role** · ${silenced && guild.roles.cache.has(silenced) ? `<@&${silenced}>` : `none · ${commandMention(bot, 'silencerole')}`}`,
				`**Silenced members** · ${silencedMembers} · ${commandMention(bot, 'silencemember')}`,
			];

			const channel = interaction.channel as GuildChannel;
			const granted = channel.permissionsFor(guild.members.me!);
			const missing = neededPermissions.filter(([, flag]) => !granted?.has(flag)).map(([name]) => name);
			const permissions = missing.length
				? `⚠️ Mirror is missing some permissions here, so a few commands won't work:\n${missing.map((name) => `- ${name}`).join('\n')}`
				: '✅ Mirror has every permission it needs here.';

			const card = new ContainerBuilder().setAccentColor(accentColor(guild.id));
			addHeading(card, `## ⚙️ Mirror settings\n${escapeMarkdown(guild.name)}`, guild.iconURL());
			card
				.addSeparatorComponents(divider)
				.addTextDisplayComponents((text) => text.setContent(['### Features', ...features].join('\n')))
				.addSeparatorComponents(divider)
				.addTextDisplayComponents((text) => text.setContent(['### Roles', ...roles].join('\n')))
				.addSeparatorComponents(divider)
				.addTextDisplayComponents((text) =>
					text.setContent(`### Permissions in <#${channel.id}>\n${permissions}`)
				);

			return void interaction.reply({ components: [card], ...cardReply });
		} catch (err) {
			bot.logger.commandError(interaction.channel!.id, this.name, err);
			return void interaction.reply({
				content: 'Error detected, contact an admin to investigate.',
				flags: MessageFlags.Ephemeral,
			});
		}
	}
	guildRequired?: boolean | undefined = true;
}
