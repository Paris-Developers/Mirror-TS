import { ChatInputCommandInteraction, CacheType } from 'discord.js';
import { VoiceConnectionStatus, getVoiceConnection } from 'discord-voip';
import { Bot } from '../Bot';
import { Option, Subcommand } from './Option';
import { SlashCommand } from './SlashCommand';
import { respond } from '../resources/respond';
import { leftOnPurpose } from './DefaultVc';

export class DestroyQueue implements SlashCommand {
	name: string = 'destroyqueue';
	description: string = 'Empty and destroy the queue, will reset the music player entirely';
	options: (Option | Subcommand)[] = [];
	requiredPermissions: bigint[] = [];
	async run(bot: Bot, interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
		try {
			const guildId = interaction.guild!.id;
			leftOnPurpose(guildId);
			bot.player.nodes.get(guildId)?.delete();
			//a connection that lost its queue, or is stuck reconnecting, is part of the reset too
			const leftover = getVoiceConnection(guildId, bot.client.user!.id);
			if (leftover && leftover.state.status !== VoiceConnectionStatus.Destroyed) leftover.destroy();
			return void (await respond(interaction, 'Reset the queue', false));
		} catch (err) {
			bot.logger.commandError(interaction.channelId, this.name, err);
			return void (await respond(interaction, 'Error: contact a developer to investigate'));
		}
	}
	guildRequired?: boolean | undefined = true;
	managerRequired?: boolean | undefined;
	blockSilenced?: boolean | undefined = true;
	musicCommand?: boolean | undefined = true;
}
