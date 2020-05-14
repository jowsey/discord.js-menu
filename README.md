![logo](https://i.imgur.com/nQSqrrk.png)
<h4 align="center">Automatically create Discord.js embed menus with reactions and multiple completely customisable pages.</h4>

### Installation
In your project directory:
```bash
npm install discord.js-menu
```
In your code file:
```js
const { Menu } = require('discord.js-menu');
```
It's as easy as that!

### Examples
I wanted to make menus as easy as possible to create - it can be quite daunting at first, but I don't think it's too bad!
Creating and sending a message is as easy as importing the Menu class and instantiating one.
For this example, let's presume we're trying to show the user a help menu, with a list of commands, or similar.
```js
const { Client, MessageEmbed } = require('discord.js');
const { Menu } = require('discord.js-menu');
const client = new Client();

client.on('message', message => {
    if (message.content == "help") {
        // Creating the menu like this will automatically send it and handle reactions - basically everything.
        // I recommend you import this big array from a secondary file to clean up your code - your choice though.
        new Menu(message.channel, message.author.id, [
            {
                name: "main",
                content: new MessageEmbed({
                    title: "Help",
                    description: "Commands list:",
                    fields: [
                        {
                            name: "command1",
                            value: "this command does stuff"
                        }
                    ]
                }),
                reactions: {
                    "⏹": "stop",
                    "▶": "next",
                    "⚙": "otherPage"
                }
            },
            {
                name: "otherPage",
                content: new MessageEmbed({
                    title: "More Help!",
                    description: "Here are some more commands!",
                    fields: [
                        {
                            name: "You get the idea.",
                            value: "You can create as many of these pages as you like."
                            // (Each page can only have 20 reactions, though. Discord's fault.)
                        }
                    ]
                }),
                reactions: {
                    "⏹": "stop",
                    "◀": "previous",
                    "1️⃣": "first"
                }
            }
        ]);
    }
});


client.login(...);
```
This is a relatively small menu, at only 2 pages. You can theoretically have as many pages as you want - I've tested it with up to 10, but you can totally go higher.

### Creating the menu, in-depth
```js
new Menu(channel, userID, pages)
```
Channel and userID are both relatively obvious - a channel to send the message to, and the ID of the user you wish to let control the menu - the pages array is a little more complex, though, as you might've seen.  
`pages` is an array of objects; each object is it's own page in the menu.  
Every page has three items: a `name`, which is used as a destination for your reactions, the `content` (a MessageEmbed), and a set of `reactions` for that page.  
Each reaction is an emoji, and its value is a destination you have set. Every page's name is a destination. There are also 5 other destinations that serve various functions.  

**first** - Goes to the first page in the array.  
**last** - Goes to the last page in the array.  
**previous** - Goes to the previous page in the array.  
**next** - Goes to the next page in the array.  
**stop** - Removes the reactions and deletes the menu message.  

Note that calling one of your pages one of these will still technically work - the page would still be accessible using these destinations, ironically - but you wouldn't be able to directly link to it.  

### Acknowledgements
This project was heavily inspired by Juby210's [discord.js-reaction-menu](https://github.com/Juby210/discord.js-reaction-menu). It's a great project, and I was originally using it, but in the end, creating my own version seemed more worthwhile. Much respect to Juby210, though!
