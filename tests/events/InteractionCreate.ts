import MockDiscord from "../mock";
import InteractionCreate from "../../src/events/InteractionCreate";
import { CommandInteraction, TextBasedChannel } from "discord.js";

describe("InteractionCreate", () => {
    let mockDiscord: MockDiscord;

    beforeEach(() => {
        mockDiscord: new MockDiscord();
    });

    it("Should prevent someone from using a command as a silenced member", () => {
        const secondMock = new MockDiscord();
        const interaction = new CommandInteraction();
    })
})