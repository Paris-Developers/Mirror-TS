import { QueueRepeatMode, Track } from "discord-player";
import { CommandInteraction, CacheType, EmbedBuilder } from "discord.js";
import { Bot } from "../Bot";
import { colorCheck } from "../resources/embedColorCheck";
import { Option, Subcommand } from "./Option";
import { SlashCommand } from "./SlashCommand";

export class Loop implements SlashCommand{
    name: string = 'loop';
    description: string = 'Loop the song that is currently playing';
    options: (Option | Subcommand)[] = [];
    requiredPermissions: bigint[] = [];
    run(bot: Bot, interaction: CommandInteraction<CacheType>): Promise<void> {
        try {
            const embed = new EmbedBuilder().setColor(colorCheck(interaction.guild!.id));

            let queue = bot.player.getQueue(interaction.guild!.id);
            if(!queue || !queue.playing) {
                embed.setDescription('There is no music playing!');
                interaction.reply({embeds: [embed]});
                return;
            }
            if(queue.repeatMode){
                embed.setDescription('Stopped looping');
                queue.setRepeatMode(QueueRepeatMode.OFF);
                return interaction.reply({embeds: [embed]});
            }
            queue.setRepeatMode(QueueRepeatMode.TRACK);
            embed.setDescription(`Now looping **${queue.nowPlaying().title}** by *${queue.nowPlaying().author}*.  Use \`/skip\` to continue the queue`);
            return interaction.reply({embeds:[embed]});
        }
        catch (err) {
			bot.logger.commandError(interaction.channel!.id, this.name, err);
			return interaction.reply({
				content: 'Error: contact a developer to investigate',
				ephemeral: true,
			});
		}
    }
    guildRequired?: boolean | undefined = true;
    managerRequired?: boolean | undefined;
    blockSilenced?: boolean | undefined = true;
    musicCommand?: boolean | undefined = true;

}