import { CommandInteraction } from 'discord.js';
import 'ts-jest';
import {Test} from "../../src/slashcommands/Test";
import MockDiscord from "../mock"
import { MockInteraction } from '../mock/interaction';

describe("test interaction.run command", () => {
    let mockDiscord: MockDiscord;

    beforeEach(() => {
        mockDiscord: new MockDiscord();
    })
});


var Command = new Test();
test('test', () => {
    const secondMock = new MockDiscord();
    const interaction = new MockInteraction();
    Command.run(secondMock.getClient().bot, interaction)
})