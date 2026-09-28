//Referenced from Sicko.ts
//Call it when you're leaving to go eat food

import {
	ChatInputCommandInteraction,
	CacheType,
	GuildMember,
	PermissionFlagsBits,
} from 'discord.js';
import path from 'path';
import { Bot } from '../Bot';
import { Option, Subcommand } from './Option';
import { SlashCommand } from './SlashCommand';
import { VoiceJoinError, queueBusy } from '../resources/CustomPlayer';
import { respond } from '../resources/respond';
import { answeredElsewhere } from '../resources/instanceGuard';

export class Munch implements SlashCommand {
	name: string = 'munch';
	description: string = 'Time to go munch some grub. But I will return.';
	options: (Option | Subcommand)[] = [];
	//deafening is checked on the voice channel below. Mirror's invite link doesn't include it, so the
	//sound still plays where Mirror isn't allowed to deafen people
	requiredPermissions: bigint[] = [];
	async run(
		bot: Bot,
		interaction: ChatInputCommandInteraction<CacheType>
	): Promise<void> {
		try {
			let member = interaction.member as GuildMember;
			let state = member.voice;
			if (!state.channel) {
				await respond(interaction, 'you are not in a valid voice channel!', false);
				return;
			}
			//an idle queue is fine, but don't talk over music, even between two songs
			if (queueBusy(bot.player.nodes.get(interaction.guild!.id))) {
				await respond(interaction, 'Cant go munch while music is playing :sob:', false);
				return;
			}
			//joining voice can take longer than the 3 seconds Discord waits for a reply, so acknowledge first
			await interaction.deferReply();
			await bot.player.playFile(
				state.channel,
				path.resolve('music/minecraft-eating-sound.mp3')
			);
			//they may have left voice while the sound was playing
			const voiceChannel = state.channel;
			if (!voiceChannel) return void (await interaction.editReply(`<@${interaction.user.id}> left before lunch.`));
			const eating = !state.deaf;
			const me = interaction.guild!.members.me;
			const canDeafen = !!me && !!voiceChannel.permissionsFor(me)?.has(PermissionFlagsBits.DeafenMembers);
			const deafened = canDeafen
				? await state.setDeaf(eating, eating ? 'eating' : 'no longer eating').then(() => true, () => false)
				: false;
			const lunch = eating ? 'has gone to munch a lunch.' : 'had a nice lunch.';
			const note = deafened ? '' : eating ? " (Mirror isn't allowed to deafen people here)" : " (Mirror isn't allowed to undeafen people here)";
			await interaction.editReply(`<@${interaction.user.id}> ${lunch}${note}`);
			return;
		} catch (err) {
			//another copy of Mirror answered this command first; it's logged, and there's no one to reply to
			if (answeredElsewhere(bot, err)) return;
			if (err instanceof VoiceJoinError) return void (await respond(interaction, err.message));
			bot.logger.commandError(interaction.channelId, this.name, err);
			await respond(interaction, 'Error: contact a developer to investigate');
			return;
		}
	}
	guildRequired?: boolean = true;
	musicCommand?: boolean = true;
}
