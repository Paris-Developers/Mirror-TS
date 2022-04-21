import { Client, Guild, GuildMember, Interaction, TextBasedChannel } from "discord.js";
import { RawMessageData } from "discord.js/typings/rawDataTypes";

export class MockInteraction {
    static new(
        channel: TextBasedChannel,
        guild: Guild,
        member: GuildMember,
        client: Client,
        data: RawMessageData
    ): Interaction {
        const interaction = Reflect.construct(Interaction, [client, data]);

        Object.defineProperty(interaction, "guild",{
            get: () => guild,
        });
        return interaction;
    }

}