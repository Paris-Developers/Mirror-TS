import { Test } from './Test';
import { Command } from './Command';
import Enmap from 'enmap';

let CommandsEnmap = new Enmap();
CommandsEnmap.set('test', new Test());

export let Commands = CommandsEnmap;
