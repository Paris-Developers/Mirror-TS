import {
	InteractionEditReplyOptions,
	InteractionReplyOptions,
	MessageFlags,
	RepliableInteraction,
} from 'discord.js';

//answers an interaction whatever state it is in. Once a command has deferred or replied, Discord
//only accepts an edit, and calling reply() again throws, which used to leave the user looking at
//"Mirror is thinking..." forever. This is mostly called from catch blocks, so it never throws:
//an interaction that has expired or was answered elsewhere simply can't be answered any more
export async function respond(
	interaction: RepliableInteraction,
	message: string | InteractionReplyOptions,
	ephemeral = true
): Promise<boolean> {
	const options: InteractionReplyOptions =
		typeof message === 'string' ? { content: message } : { ...message };
	try {
		if (interaction.deferred || interaction.replied) {
			//an ephemeral defer stays ephemeral, and an edit cannot change that either way
			const { flags: _flags, ...edit } = options;
			await interaction.editReply(edit as InteractionEditReplyOptions);
		} else {
			if (ephemeral) options.flags = MessageFlags.Ephemeral;
			await interaction.reply(options as InteractionReplyOptions & { withResponse?: false });
		}
		return true;
	} catch {
		return false;
	}
}
