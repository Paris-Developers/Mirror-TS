import { Client, CommandInteraction, CommandInteractionOptionResolver, Guild, GuildMember, Interaction, TextBasedChannel } from "discord.js";
import { RawMessageData } from "discord.js/typings/rawDataTypes";

export class MockInteraction {
    static new(
        client: Client,
        options: CommandInteractionOptionResolver,

    ): CommandInteraction {
        const interaction = Reflect.construct(CommandInteraction, [client]);

        return interaction;
    }

}