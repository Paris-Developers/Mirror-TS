import { EventHandler } from './EventHandler';
import { InteractionCreate } from './InteractionCreate';
import { Ready } from './Ready';

export let Events: Array<EventHandler> = [new InteractionCreate(), new Ready()];
