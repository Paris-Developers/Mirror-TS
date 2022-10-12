import { CommandInteraction, CacheType, MessageEmbed, Message, User, MessageReaction } from 'discord.js';
import { Bot } from '../Bot';
import { Option, Subcommand } from './Option';
import { SlashCommand} from './SlashCommand';
import { bdayDates } from './Birthday';

type monthIndex = { [index: number]: string};
const monthCode = {
	1: 'January',
	2: 'February',
	3: 'March',
	4: 'April',
	5: 'May',
	6: 'June',
	7: 'July',
	8: 'August',
	9: 'September',
	10: 'October',
	11: 'November',
	12: 'December',
} as monthIndex;

export class BirthdayList implements SlashCommand {
    name: string = 'birthdaylist'
    description: string = '[MANAGER] See all the birthdays in the current guild'
    options: (Option | Subcommand)[] = [];
    requiredPermissions: bigint[] = [];
    async run(bot: Bot, interaction: CommandInteraction<CacheType>): Promise<void> {
        await interaction.deferReply();
        bdayDates.fetchEverything();
        let list: any[][] = [];
        for(const date of bdayDates){
            try{
                let member = await interaction.guild!.members.fetch(date[0].toString());
                let birthdate = date[1].slice(' ').split('-');
                list.push([member, birthdate[1], birthdate[0]]) 
            } catch (err) {
            }
        }
        list = sort(list);
        var userPageOne = '';
        var userPageTwo = '';
        var userPageThree = '';
        var datePageOne = '';
        var datePageTwo = '';
        var datePageThree = '';
        let count = 0;
        for(let x of list){
            if (count >= 48) {
                userPageThree += `${x[0]}\n`;
                datePageThree += `${monthCode[x[1]]} ${x[2]}\n`;
                count ++
                continue
            }
            if (count >= 24) {
                userPageTwo += `${x[0]}\n`;
                datePageTwo += `${monthCode[x[1]]} ${x[2]}\n`;
                count++
                continue
            }
            userPageOne += `${x[0]}\n`;
            datePageOne += `${monthCode[x[1]]} ${x[2]}\n`;
            count ++
        }
        let embedArray: [MessageEmbed];
        const pageOne = new MessageEmbed()
        .addFields({
            name: 'User',
            value: userPageOne,
            inline: true,
        },{
            name: 'Birthday',
            value: datePageOne,
            inline: true,
        })
        .setTitle(`Birthday List for ${interaction.guild!.name}`);
        embedArray = [pageOne];

        if(userPageTwo != ''){
            const pageTwo = new MessageEmbed()
            .addFields({
                name: 'User',
                value: userPageTwo,
                inline: true,
            },{
                name: 'Birthday',
                value: datePageTwo,
                inline: true,
            })
            .setTitle(`Birthday List for ${interaction.guild!.name}`);
            embedArray.push(pageTwo);
        }

        if(userPageThree != ''){
            const pageThree = new MessageEmbed()
            .addFields({
                name: 'User',
                value: userPageTwo,
                inline: true,
            },{
                name: 'Birthday',
                value: datePageTwo,
                inline: true,
            })
            .setTitle(`Birthday List for ${interaction.guild!.name}`);
            embedArray.push(pageThree);
        }
        pageOne.setFooter({text: `Page 1 of ${embedArray.length}`});
        let index = 0
        let message = await interaction.editReply({
            embeds: [embedArray[0]]}) as Message;
        await message.react('⏪');
        await message.react('⏩');
        const filter = (reaction: MessageReaction, user: User) => {
            return (
                ['⏪', '⏩'].includes(reaction.emoji.name!) &&
                user.id === interaction.user.id
            ); //if reaction emoji matches one of the two in this array + it was reacted by the interaction creator
        };
        const collector = message.createReactionCollector({
            filter,
            time: 60000,
        });
        collector.on('collect', (reaction, user) => {
            if (reaction.emoji.name == '⏩') {
                index += 1;
            } else if (reaction.emoji.name == '⏪') {
                index -= 1;
            } else return;
            if (index > embedArray.length - 1) {
                index = 0;
            } else if (index < 0) {
                index = embedArray.length - 1;
            }
            message.edit({ embeds: [embedArray[index]] });
            reaction.users.remove(user.id); //remove the emoji so the user doesn't have to remove it themselves
        });
    }
    guildRequired?: boolean | undefined = true;
    managerRequired?: boolean | undefined;
    blockSilenced?: boolean | undefined;
    musicCommand?: boolean | undefined;
}

var sort = function(arr: any[]){
	arr.sort(function (a,b){
		if(a[1] > b[1]) return 1;
		if(a[1] < b[1]) return -1;
        if(a[1] = b[1]){
            if(a[2] > b[2]) return 1
            if(a[2] < b[2]) return -1
        }
		return 0;
	})
	return arr;
}
