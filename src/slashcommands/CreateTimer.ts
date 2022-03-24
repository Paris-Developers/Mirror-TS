import { ApplicationCommandDataResolvable, CommandInteraction, CacheType } from "discord.js";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { Bot } from "../Bot";
import { SlashCommand } from "./SlashCommand";

const messageOptions = [
    { name: 'Weather', value: 'weather',},
    { name: 'Stock', value: 'stock',},
    { name: 'Nasa', value: 'nasa',}
];
const scheduleOptions = [
    { name: 'Daily', value: 'daily'},
    { name: 'Weekly', value: 'Weekly'},
    { name: 'Weekdays', value: 'weekdays'},
];
const timezones = [
	{ name: 'GMT', value: 'gmt' },
	{ name: 'CET', value: 'cet' },
	{ name: 'EET', value: 'eet' },
	{ name: 'EST', value: 'est' },
	{ name: 'CST', value: 'cst' },
	{ name: 'MST', value: 'mst' },
	{ name: 'PST', value: 'pst' },
];

export class CreateTimer implements SlashCommand{
    name: string = 'createtimer';
    registerData: ApplicationCommandDataResolvable = {
        name: this.name,
        description: 'Create a schedule message for your server',
        options: [{
            name: 'messageoptions',
            description: 'The type of message you would like to put on a timer',
            required: true,
            type: ApplicationCommandOptionTypes.STRING,
            choices: messageOptions,
        },{
            name: 'query',
            description: 'The content (if needed) for your bot to search for',
            required: false,
            type: ApplicationCommandOptionTypes.STRING,
        },{
            name: 'scheduleoptions',
            description: 'How frequently you want to recieve the timers message',
            required: true,
            type: ApplicationCommandOptionTypes.STRING,
            choices: scheduleOptions
        },{
            name: 'channel',
            description: 'The Channel you would like the timer to be sent in',
            required: true,
            type: ApplicationCommandOptionTypes.CHANNEL
        },{
            name: 'hour',
            description:
                'The hour you want to send Birthday messages in local time, military format (0-23)',
            type: 'INTEGER',
            required: true,
        },{
            name: 'minute',
            description: 'The minute you want to send Birthday messages',
            type: 'INTEGER',
            required: true,
        },{
            name: 'timezone',
            description: 'Your local timezone',
            type: 'STRING',
            required: true,
            choices: timezones,
        }],
    }
    requiredPermissions: bigint[] = [];
    run(bot: Bot, interaction: CommandInteraction<CacheType>): Promise<void> {
        //TODO: Get all obvious checks down
        //check if they have more than the max amount of timers allowed
        //check hours
        //check minutes
        //check perms in channel

        let minute = interaction.options.getInteger('minute');
        //TODO: check if between 0-59

        let hour = interaction.options.getInteger('hour');
        //TODO: Check if between 0-24

        let query = interaction.options.getString('query');

        let channel = interaction.options.getChannel('channel');
        //TODO: Check Perms
        //TODO: Check if channel is a text channel

        let scheduleOptions = interaction.options.getString('scheduleoptions');
        let timezone = 'timezone';

        //TODO handle the specific syntax for the timer they are requesting
        if(interaction.options.getString('messageOptions')=='weather'){

        }
        
        //TODO show them an example embed in the current channel,
        //if they find this satisfactory, allow them to approve and continue configuration

        //TODO schedule and store the timer

        //INFOSTRING EXAMPLE: 'MM-HH-DOW-TIMEZONE-TYPE-QUERY'
        //DOW: Date of Week
        //TYPE: type of timer (i.e. weather or stock)
        //QUERY: What they are searching up (i.e. Burnsville)

        //TODO update config and create a way to delete timers, with a new function.
        throw new Error("Method not implemented.");
    }
    guildRequired?: boolean | undefined = true;
    managerRequired?: boolean | undefined;
    //TODO: silence check

}