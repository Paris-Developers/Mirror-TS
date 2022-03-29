import { EventHandler } from './EventHandler';
import { InteractionCreate } from './InteractionCreate';
import { MessageCreate } from './MessageCreate';
import { Ready } from './Ready';
import { VoiceStateUpdate } from './VoiceStateUpdate';
import { Error } from './Error';

export let Events: Array<EventHandler> = [
	new InteractionCreate(),
	new Ready(),
	new VoiceStateUpdate(),
	new MessageCreate(),
	new Error(),
];
