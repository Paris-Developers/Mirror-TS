# Contributing

Creating new commands, event handlers, and keywords is pretty simple.  
We have interfaces for all of them, you only need to implement them to start creating a new one.  
See [the test file](../src/slashcommands/Test.ts) for basic slash command structure.

A new command or keyword needs nothing but its own file: the bot reads the `slashcommands`, `usercommands`, `messagecommands`, `events` and `keywords` folders when it starts and loads whatever it finds. It builds each one from the class named after its file, so `Poll.ts` has to export `class Poll`.

See [Building the bot](BUILDING.md) for installing and running it.
