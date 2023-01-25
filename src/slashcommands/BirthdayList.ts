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
        let memberFetch = await interaction.guild!.members.fetch();
        memberFetch.forEach(async (member) => {
            let birthdate = bdayDates.get(member.id)
            if(!birthdate) return;
            birthdate = birthdate.slice(' ').split('-');
            list.push([member, parseInt(birthdate[1]), parseInt(birthdate[0])])
        })
        list = sort(list);
        let pages = Math.floor(list.length / 24 + .99);
        let currentPage = 1;

        // let nameString = '';
        // let dateString = '';
        // let count = 0;
        // while(count < 24) {
        //     if(count >= list.length) break;
        //     nameString += `${list[count][0]}\n`;
        //     dateString += `${monthCode[list[count][1]]} ${list[count][2]}\n`;
        //     count ++;
        // }
        let initialPage = populatePage(1,list);

        let embed = new MessageEmbed()
        .setTitle(`Birthday List for ${interaction.guild!.name}`)
        .setFooter({text: `Page ${currentPage} of ${pages}`})
        .addFields(
            {
                name: 'User',
                value: initialPage[0],
                inline: true,
            },{
                name: 'Date',
                value: initialPage[1],
                inline: true,
            }
        )
        let index = 0;
        let message = await interaction.editReply({
            embeds: [embed]}) as Message;

        if(pages = 1) return; //exit function if server only produces one page

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
                currentPage += 1;
            } else if (reaction.emoji.name == '⏪') {
                currentPage -= 1;
            } else return;
            if (currentPage > pages) {
                currentPage = 1;
            } else if (currentPage < 1) {
                currentPage = pages;
            }
            initialPage = populatePage(currentPage, list);
            embed.setFields(
                {
                    name: 'User',
                    value: initialPage[0],
                    inline: true,
                },{
                    name: 'Date',
                    value: initialPage[1],
                    inline: true,
                }
            )
            message.edit({ embeds: [embed] });
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

var populatePage = function(pageNum: number, arr: any){
    let names = '';
    let dates = '';
    let index = (pageNum - 1) * 24;
    console.log(arr.length)
    for(let ct = index; ct + index < arr.length || ct - index > 23; ct++){
        console.log(ct)
        console.log(arr[ct][0].displayName)
        names += `${arr[ct][0]}\n`
        dates += `${monthCode[arr[ct][1]]} ${arr[ct][2]}\n`
    }
    return [names,dates];
}