import {
	ChatInputCommandInteraction,
	Interaction,
	UserContextMenuCommandInteraction,
} from 'discord.js';
import { Bot } from '../Bot';
import { managerCheck } from '../resources/managerCheck';
import { commandsUsed } from '../resources/metrics';
import { handleNowPlayingButton, nowPlayingButton } from '../resources/nowPlaying';
import { missingPermissions } from '../resources/permissionsCheck';
import { respond } from '../resources/respond';
import { voiceCommandCheck } from '../resources/voiceCommandCheck';
import { answeredElsewhere, handledHere } from '../resources/instanceGuard';
import { silenceCheck } from '../slashcommands/SilenceRole';
import { EventHandler } from './EventHandler';

export class InteractionCreate implements EventHandler {
	eventName = 'interactionCreate';

	async process(bot: Bot, interaction: Interaction) {
		if (!handledHere(bot, interaction.guildId)) return;
		//the now playing card's buttons outlive any one command, so they're handled here
		if (interaction.isButton() && interaction.customId.startsWith(nowPlayingButton)) {
			return void handleNowPlayingButton(bot, interaction).catch((error) => {
				if (!answeredElsewhere(bot, error)) bot.logger.error('Now playing button failed:', error);
			});
		}
		//entries on the right-click menu for a person, such as Birthday
		if (interaction.isUserContextMenuCommand()) {
			const command = bot.userCommands.find(
				(command) => command.name === interaction.commandName
			);
			if (!command) return;
			commandsUsed.inc({
				command: command.name,
				guild: interaction.guild?.name ?? 'direct message',
			});
			//silenced members are only known inside a server; in a direct message there is no one to check
			if (command.blockSilenced && interaction.inCachedGuild() && (await silenceCheck(interaction))) {
				return void (await respond(interaction, 'This command cannot be used by silenced members'));
			}
			return void (await runCommand(bot, interaction, command.name, () =>
				command.run(bot, interaction)
			));
		}
		if (!interaction.isChatInputCommand()) return;

		//attempt to find the command from the array of all of them
		const command = bot.slashCommands.find(
			(command) => command.name === interaction.commandName
		);

		//we didn't find it, exit
		if (!command) return;
		commandsUsed.inc({
			command: command.name,
			guild: interaction.guild?.name ?? 'direct message',
		});

		//the manager, silence and voice checks all look inside the server, so those commands need one too.
		//this asks where the command came from rather than what kind of channel it was typed in: threads and
		//forum posts aren't GuildChannels in discord.js, so music commands used there were wrongly refused
		const needsServer = command.guildRequired || command.managerRequired || command.musicCommand;
		if (needsServer && !interaction.inCachedGuild()) {
			return void (await respond(interaction, 'Command must be used in a server'));
		}
		if (command.managerRequired && !(await managerCheck(interaction))) {
			return void (await respond(
				interaction,
				'This command can only be used by designated managers or admininstrators'
			));
		}
		if (command.blockSilenced && interaction.inCachedGuild() && (await silenceCheck(interaction))) {
			return void (await respond(interaction, 'This command cannot be used by silenced members'));
		}
		//say which permissions are missing rather than going quiet, which Discord shows as "did not respond".
		//answering a command doesn't need Send Messages itself, so this reply always gets through
		const missing = missingPermissions(interaction, command.requiredPermissions);
		if (missing.length > 0) {
			const channelName = interaction.inCachedGuild() ? interaction.channel?.name : undefined;
			bot.logger.warn(
				`Missing ${missing.join(', ')} to use ${command.name} in channel: ${
					channelName ?? interaction.channelId
				}, in ${interaction.guild?.name}`
			);
			const names =
				missing.length == 1
					? missing[0]
					: `${missing.slice(0, -1).join(', ')} and ${missing[missing.length - 1]}`;
			return void (await respond(
				interaction,
				`Mirror needs the ${names} permission${missing.length == 1 ? '' : 's'} in this channel to use /${
					command.name
				}. A server admin can give ${missing.length == 1 ? 'it' : 'them'} to Mirror's role.`
			));
		}
		//voiceCommandCheck answers the person itself whenever it says no
		if (command.musicCommand && !(await voiceCommandCheck(bot, interaction))) return;
		await runCommand(bot, interaction, command.name, () => command.run(bot, interaction));
	}
}

//commands catch their own errors, so this only matters when that catch goes wrong as well. Before, the
//person was left looking at "Mirror is thinking..." and the log only had an unhandled rejection with no command name
async function runCommand(
	bot: Bot,
	interaction: ChatInputCommandInteraction | UserContextMenuCommandInteraction,
	name: string,
	run: () => Promise<void>
) {
	try {
		await run();
	} catch (error) {
		if (answeredElsewhere(bot, error)) return;
		bot.logger.commandError(interaction.channelId, name, error);
		//a command that already answered keeps its answer
		if (!interaction.replied) await respond(interaction, 'Error: contact a developer to investigate');
	}
}
