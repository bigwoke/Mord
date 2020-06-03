# Mord
I made this originally to keep quotes for my friends in Discord. As I came up with some more interesting things that I could make the bot do, I added some new features. As a result, this bot serves a few different functions, but the quote functionality is still the core.

Mord is written using Node.JS, and has been rewritten to get where it is currently, the first version was based more on my [tsbot](https://github.com/bigwoke/tsbot), where I used [Discord.JS](https://discord.js.org/) directly. I wasn't happy with the first version, and I wanted more structure. This led to using the [Akairo](https://discord-akairo.github.io/#/) framework for Discord.js and starting things from the beginning. This allowed me to make things function consistently, while also allowing me to modify and add to some of the functionality of Akairo, **unlike** Discord JS Commando, the command framework written by the creators of Discord.js.

Other than Discord.js and Akairo, Mord also uses MongoDB for persistent data storage, for both bot settings and quotes.

## Commands

Commands available to users can be seen using the `help` command. All commands are self-documenting in the sense that any information in that command's help entry will be based directly off of the command code itself, ensuring as much consistency as possible (and ease of documenting). Some commands require certain permissions to use, either in the discord server itself, or the user may need to be the owner.