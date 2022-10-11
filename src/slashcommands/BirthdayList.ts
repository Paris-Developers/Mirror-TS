import { CommandInteraction, CacheType, MessageEmbed } from 'discord.js';
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
        await interaction.deferReply({ephemeral : true});
        let runstring = '';
        bdayDates.fetchEverything();
        let list: any[][] = [];
        for(const date of bdayDates){
            try{
                let member = await interaction.guild!.members.fetch(date[0].toString());
                let birthdate = date[1].slice(' ').split('-');
                //let month = monthCode[birthdate[1]]
                list.push([member, birthdate[1], birthdate[0]])  //user - month - day
                //runstring += `${member} : ${month} ${birthdate[0]}\n`
            } catch (err) {
            }
        }
        list = sort(list);
        var userString = '';
        var dateString = '';
        for(let x of list){
            userString += `${x[0]}\n`;
            dateString += monthCode[x[1]] + ' ' + x[2];
        }


        // forEach(async (date, userId) => {
        //     try {
        //         console.log(userId);
        //         var member = await interaction.guild?.members.fetch(userId.toString());
                
        //         console.log(member?.displayName);
        //     } catch(err) {
        //         console.log(err);
        //         return;
        //     }
        // });
        const embed = new MessageEmbed();
        embed.addFields({
            name: 'User',
            value: userString,
            inline: true,
        },{
            name: 'Birthday',
            value: dateString,
            inline: true,
        })
        embed.setTitle(`Birthday List for ${interaction.guild!.name}`)
        interaction.editReply({embeds: [embed]});
    }
    guildRequired?: boolean | undefined = true;
    managerRequired?: boolean | undefined;
    blockSilenced?: boolean | undefined;
    musicCommand?: boolean | undefined;
}

var sort = function(arr: any[]){
	arr.sort(function (a,b){
		if(a[1] < b[1]) return 1;
		if(a[1] > b[1]) return -1;
        if(a[1] = b[1]){
            if(a[2] < b[2]) return 1
            if(a[2] > b[2]) return -1
        }
		return 0;
	})
	return arr;
}
