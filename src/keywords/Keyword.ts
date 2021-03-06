import { Message } from 'discord.js';
import { Bot } from '../Bot';

export interface Keyword {
	name: string;
	requiredPermissions: bigint[];
	run(bot: Bot, message: Message, args: Array<String>): Promise<void>;
}
