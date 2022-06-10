import MockDiscord from "../mock";
import { CommandInteraction, TextBasedChannel } from "discord.js";
import { MockInteraction } from "../mock/interaction";

describe("InteractionCreate", () => {
    let mockDiscord: MockDiscord;

    beforeEach(() => {
        mockDiscord: new MockDiscord();
    });

    it("Should prevent someone from using a command as a silenced member", () => {
        const secondMock = new MockDiscord();
        const interaction = new MockInteraction();
    })
})