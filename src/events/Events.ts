import { EventHandler } from './EventHandler';
import { InteractionCreate } from './InteractionCreate';
import { Ready } from './Ready';
import { VoiceStateUpdate } from './VoiceStateUpdate';

export let Events: Array<EventHandler> = [
	new InteractionCreate(),
	new Ready(),
	new VoiceStateUpdate(),
];
