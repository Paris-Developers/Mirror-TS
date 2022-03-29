import { ApplicationCommandDataResolvable, CommandInteraction, CacheType, MessageEmbed, Message, MessageReaction, User } from "discord.js";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { Bot } from "../Bot";
import { weatherEmbed } from "../resources/embed constructors/weatherEmbed";
import { scheduleTimer } from "../resources/scheduleTimer";
import { SlashCommand } from "./SlashCommand";
import { guildTimers } from "../resources/scheduleTimer";
import { Option, Subcommand } from "./Option";

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
    name: 'createtimer';
    description: string = 'Schedule a timer';
    options: (Option | Subcommand)[] = [
        new Option(
            'messageoptions',
            'The type of message you would like to put on a timer',
            ApplicationCommandOptionTypes.STRING,
            true,
            false,
            messageOptions
        ),
        new Option(
            'query',
            'The content (if needed) for your bot to search for',
            ApplicationCommandOptionTypes.STRING,
            false,
        ),
        new Option(
            'scheduleoptions',
            'How frequently you want to recieve the timers message',
            ApplicationCommandOptionTypes.STRING,
            true,
            false,
            scheduleOptions
        ),
        new Option(
            'channel',
            'The Channel you would like the timer to be sent in',
            ApplicationCommandOptionTypes.STRING,
            true,
        ),
        new Option(
            'hour',
            'The hour you want to send your timer in local, military time (0-23)',
            ApplicationCommandOptionTypes.INTEGER,
            true,
        ),
        new Option(
            'minute',
            'The minute you want your timer to send',
            ApplicationCommandOptionTypes.INTEGER,
            true,
        ),
        new Option(
            'timezone',
            'Your local timezone',
            ApplicationCommandOptionTypes.STRING,
            true,
            false,
            timezones,
        )
    ]
    requiredPermissions: bigint[] = [];
    async run(bot: Bot, interaction: CommandInteraction<CacheType>): Promise<void> {
        try{
            //TODO: Get all obvious checks down
            //check if they have more than the max amount of timers allowed
            //check hours
            //check minutes
            //check perms in channel
            let guildArray = guildTimers.ensure(interaction.guild!.id, []);
            if (guildArray.length >= 10) return interaction.reply('You have reached the maximum number of timers, please delete on before adding another');

            let minute = interaction.options.getInteger('minute')!;
            if(minute >59 || minute < 0) return interaction.reply('Please enter a valid minute between 0 and 59');
            //TODO: check if between 0-59

            let hour = interaction.options.getInteger('hour')!;
            if(hour > 23 || hour<0) return interaction.reply('Please enter a valid hour between 0 and 23');
            //TODO: Check if between 0-24

            let query = interaction.options.getString('query')!;

            let channel = interaction.options.getChannel('channel');
            //TODO: Check Perms
            //TODO: Check if channel is a text channel

            let scheduleOptions = interaction.options.getString('scheduleoptions');
            let timezone = 'timezone';

            //TODO handle the specific syntax for the timer they are requesting
            var embed: MessageEmbed;
            if(interaction.options.getString('messageOptions')=='weather'){
                try{
                    embed = await weatherEmbed(bot,query) as MessageEmbed;
                } catch (err){
                    interaction.reply('We has a problem constructing your message, try again');
                    bot.logger.error(interaction.channel?.id, this.name,err);
                    return;
                }
            }
            let response = await interaction.reply({
                content:"Here is your timers content, react with :regional_indicator_y: if you want to continue to schedule this timer, and :regional_indicator_x: if not", 
                embeds: [embed!],
                fetchReply:true}) as Message;
            await response.react(':regional_indicator_y:');
            await response.react(':regional_indicator_n:');
            const filter = (reaction: MessageReaction, user: User) => {
                if(user.id != interaction.user.id) return false;
                return !user.bot;
            }
            const collector = response.createReactionCollector({
                filter,
                time: 20000,
                dispose: true,
            });
            collector.on('collect', async (reaction: MessageReaction, user: User) => {
                if(reaction.emoji.name == 'regional_indicator_y:'){
                    const timer ={
                        "min":minute,
                        "hour":hour,
                        "dow":scheduleOptions,
                        "timezone": timezone,
                        "type" : interaction.options.getString('messageOptions'),
                        "query" : query,
                    } as Object;
                    guildTimers.set(interaction.guild!.id, guildArray);
                    await scheduleTimer(interaction.guild!.id, bot, timer);
                    embed.setFooter({text:'successfully scheduled your timer!'});
                }
            })
            
            
            //TODO show them an example embed in the current channel,
            //if they find this satisfactory, allow them to approve and continue configuration

            //TODO schedule and store the timer

            //INFOSTRING EXAMPLE: 'MM-HH-DOW-TIMEZONE-TYPE-QUERY'
            //DOW: Date of Week
            //TYPE: type of timer (i.e. weather or stock)
            //QUERY: What they are searching up (i.e. Burnsville)

            //TODO update config and create a way to delete timers, with a new function.
            return;
        } catch (err){
            //TODO: update this
            return interaction.reply('test');
        }
    }
    guildRequired?: boolean | undefined = true;
    managerRequired?: boolean | undefined;
    blockSilenced? = true;
    //TODO: silence check

}