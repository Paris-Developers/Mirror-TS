//All commands that appear when someone right-clicks a person derive from this interface.
//Discord shows them under Apps on the right-click menu, and under Apps after a long press on phones
import { UserContextMenuCommandInteraction } from 'discord.js';
import { Bot } from '../Bot';

export interface UserCommand {
	//the entry on the menu, shown exactly as written here rather than lowercased like a slash command
	name: string;
	//function that will run when the entry is picked
	run(bot: Bot, interaction: UserContextMenuCommandInteraction): Promise<void>;
	//if the command blocks silenced users/roles set true
	blockSilenced?: boolean;
}
