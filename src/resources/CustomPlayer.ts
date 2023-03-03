import { Bot } from '../Bot';
import { Player, PlayerOptions } from 'discord-player';

export class CustomPlayer extends Player{
    constructor(private bot: Bot){super(bot.client)};
    
    public playOptions: PlayerOptions = {
        ytdlOptions:{ filter: "audioonly" }, //fix attempt for WRITE EPIPE error
        leaveOnEnd: false,
        leaveOnEmpty: false,
        leaveOnStop: false,
    };

    registerPlayerEvents() {
        this.on('botDisconnect', (queue) => {
            queue.destroy();
            this.deleteQueue(queue.guild);
        });
        
        this.on('queueEnd', (queue) => {
            queue.destroy;
            this.deleteQueue(queue.guild);
        });
        
        this.on('channelEmpty', (queue) => {
            queue.destroy();
            this.deleteQueue(queue.guild);
        });
        
        this.on('connectionError', (queue, error) => {
            queue.destroy();
            this.deleteQueue(queue.guild);
            this.bot.logger.error(
                `[${queue.guild.name}] Error emitted from the queue: ${error.message}`
            );
        });
        
        this.on('error', (queue, error) => {
            queue.skip();
            this.bot.logger.error(
                `[${queue.guild.name}] Error emitted from the queue: ${error.message}`
            );
        });
    }
}