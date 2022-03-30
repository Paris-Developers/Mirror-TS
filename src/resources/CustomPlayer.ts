import { Bot } from '../Bot';
import { Player, PlayerOptions } from 'discord-player';

export class CustomPlayer extends Player{
    constructor(private bot: Bot){super(bot.client)};
    
    public playOptions: PlayerOptions = {
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
            this.deleteQueue(queue.guild);
            this.bot.logger.error(
                `[${queue.guild.name}] Error emitted from the queue: ${error.message}`
            );
        });
    }
}






export function registerPlayerEvents (bot: Bot, player: Player){
    player.on('botDisconnect', (queue) => {
        queue.destroy();
        player.deleteQueue(queue.guild);
    });
    
    player.on('queueEnd', (queue) => {
        queue.destroy;
        player.deleteQueue(queue.guild);
    });
    
    player.on('channelEmpty', (queue) => {
        queue.destroy();
        player.deleteQueue(queue.guild);
    });
    
    player.on('connectionError', (queue, error) => {
        queue.destroy();
        player.deleteQueue(queue.guild);
        bot.logger.error(
            `[${queue.guild.name}] Error emitted from the queue: ${error.message}`
        );
    });
    
    player.on('error', (queue, error) => {
        player.deleteQueue(queue.guild);
        bot.logger.error(
            `[${queue.guild.name}] Error emitted from the queue: ${error.message}`
        );
    });
}