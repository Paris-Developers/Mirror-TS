import 'ts-jest';
import Discord from 'discord.js';


describe("Bot", () => {
    it("executes the help command", async () => {
      let discordClient = new Discord.Client();
      let guild = new Discord.Guild(discordClient, {
        id: Discord.SnowflakeUtil.generate(),
      });
      let user = new Discord.User(discordClient, {
        id: Discord.SnowflakeUtil.generate(),
      });
      let member = new Discord.GuildMember(
        discordClient,
        { id: Discord.SnowflakeUtil.generate(), user: { id: user.id } },
        guild
      );
      let role = new Discord.Role(
        discordClient,
        { id: Discord.SnowflakeUtil.generate() },
        guild
      );
      let message = new DiscordMessage(
        discordClient,
        {
          content: "ab help",
          author: { username: "BiggestBulb", discriminator: 1234 },
          id: "test",
        },
        new Discord.TextChannel(new Guild(discordClient), {
          client: discordClient,
          guild: new Guild(discordClient),
          id: "channel-id",
        })
      );
  
      // Your testing code goes here, with your functions using the message passed in as if passed on-ready
      const valid = Valid(message);
  
      expect(valid).toBe(true);
    });
  });