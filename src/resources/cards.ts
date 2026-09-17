//shared pieces for replies laid out as cards, Discord's newer message layout (components v2).
//cards replace embeds with sections, dividers and menus or buttons inside the message itself
import {
	ContainerBuilder,
	Message,
	MessageComponentInteraction,
	MessageFlags,
	SeparatorBuilder,
	SeparatorSpacingSize,
	resolveColor,
} from 'discord.js';
import { Bot } from '../Bot';
import { serverColors } from '../slashcommands/ServerColor';
import { normalizeColor } from './embedColorCheck';

//send cards with this flag. mentions in a card are shown but never ping anyone
export const cardReply = {
	flags: MessageFlags.IsComponentsV2 as const,
	allowedMentions: { parse: [] },
};

//the stripe down the side of a card uses the server's color, or Discord's blurple when none is set
export function accentColor(guildId: string | undefined): number {
	const color = guildId ? serverColors.get(guildId) : undefined;
	if (!color) return 0x5865f2;
	try {
		return resolveColor(normalizeColor(color));
	} catch {
		return 0x5865f2;
	}
}

//a slash command name people can click to start typing it, or the plain name if it isn't registered
export function commandMention(bot: Bot, name: string): string {
	const command =
		bot.client.application?.commands.cache.find((c) => c.name === name) ??
		bot.client.guilds.cache.get(bot.test_server)?.commands.cache.find((c) => c.name === name);
	return command ? `</${name}:${command.id}>` : `\`/${name}\``;
}

export const divider = (separator: SeparatorBuilder) =>
	separator.setDivider(true).setSpacing(SeparatorSpacingSize.Small);

//a heading with a small picture beside it when there is one, such as the server icon
export function addHeading(container: ContainerBuilder, text: string, imageUrl?: string | null) {
	if (imageUrl) {
		container.addSectionComponents((section) =>
			section
				.addTextDisplayComponents((display) => display.setContent(text))
				.setThumbnailAccessory((thumbnail) => thumbnail.setURL(imageUrl))
		);
	} else {
		container.addTextDisplayComponents((display) => display.setContent(text));
	}
}

//runs onUse when the person who ran the command uses a card's menus or buttons, tells anyone else
//to run the command themselves, and calls onExpire once the controls time out
export function handleControls(
	bot: Bot,
	message: Message,
	ownerId: string,
	onUse: (interaction: MessageComponentInteraction) => Promise<unknown>,
	onExpire: () => Promise<unknown>,
	minutes = 5
) {
	const collector = message.createMessageComponentCollector({ time: minutes * 60 * 1000 });
	collector.on('collect', async (interaction) => {
		try {
			if (interaction.user.id !== ownerId) {
				await interaction.reply({
					content: 'Only the person who ran this command can use these controls. Run it yourself to browse.',
					flags: MessageFlags.Ephemeral,
				});
				return;
			}
			await onUse(interaction);
		} catch (error) {
			bot.logger.error('Card control failed:', error);
		}
	});
	collector.on('end', () => {
		onExpire().catch((error) => bot.logger.error('Could not remove expired card controls:', error));
	});
}
