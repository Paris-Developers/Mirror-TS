import { Test } from './Test';
import { SlashCommand } from './SlashCommand';
import { BanIntro } from './BanIntro';
import { Gavin } from './Gavin';
import { Birthday } from './Birthday';
import { Help } from './Help';

export let SlashCommands: Array<SlashCommand> = [
	new Test(),
	new BanIntro(),
	new Birthday(),
	new Gavin(),
	new Help(),
];
