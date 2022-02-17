//All message commands derive from this interface
import { Bot } from '../Bot';
import { Message } from 'discord.js';

export interface MessageCommand {
	name: string;
	requiredPermissions: Array<bigint>;
	run(bot: Bot, message: Message, args: Array<string>): Promise<void>;
}
