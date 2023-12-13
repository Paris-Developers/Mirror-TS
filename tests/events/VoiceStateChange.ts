import MockDiscord from "../mock";
// import {
//   addVoiceStateUpdateHandler,
//   extractVoiceStateUpdateInfo,
//   VoiceStateChange,
//   VoiceStateUpdateEventHandlerOptions,
// } from "../../../src/event-distribution/events/voice-state-update";
import {
    VoiceStateUpdate
} from "../../src/events/VoiceStateUpdate"
import { VoiceChannel } from "discord.js";
// import {
//   InstanceOrConstructor,
//   StringIndexedHIOCTree,
// } from "../../../src/event-distribution/types/hioc";
// import { CommandHandler, DiscordEvent } from "../../../src/event-distribution";

describe("Voice State Update", () => {
let mockDiscord: MockDiscord;

    beforeEach(() => {
        mockDiscord = new MockDiscord();
    });

    it("should extract information from mute events", () => {
        const secondMock = new MockDiscord();
        const oldState = mockDiscord.getVoiceState();
        const newState = { ...secondMock.getVoiceState(), mute: true };

        const result = new VoiceStateUpdate();
        expect(result).toMatchSnapshot();
    });

    it("should extract information from multiple events", () => {
        const secondMock = new MockDiscord();
        const oldState = mockDiscord.getVoiceState();
        const newState = {
        ...secondMock.getVoiceState(),
        mute: true,
        channel: secondMock.getChannel() as VoiceChannel,
        };
    });
});