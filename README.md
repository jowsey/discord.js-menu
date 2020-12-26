<div align="center">
    <img src="https://i.imgur.com/a6Gzya2.png" width="580">
    <h4>Easily create Discord.js embed menus with reactions and unlimited customisable pages.<br>Need help? Join the support server! https://discord.gg/VBDhRc8</h4>
    <a href="https://nodei.co/npm/discord.js-menu/"><img src="https://nodei.co/npm/discord.js-menu.png"></a><br>
    <img alt="npm" src="https://img.shields.io/npm/dw/discord.js-menu">
    <img alt="npm" src="https://img.shields.io/npm/dt/discord.js-menu">
    <img alt="npm (prod) dependency version" src="https://img.shields.io/npm/dependency-version/discord.js-menu/discord.js">
</div>

### Project Summary
Create flexible, understandable and performant Discord reaction menus with ease. This package is an addon for Discord.js that automates all aspects of a reaction-based navigation menu.  
Besides creating it, of course. It'd be pretty useless if you couldn't create the menus yourself.

### Learn Discord.js-Menu in Y minutes.
Here's a fast, fully-featured demo of Discord.js-menu. With one read-through of this demo, you should have all you need to create your own menus from scratch.  
All values have TypeScript / TSDoc types, so if you use an editor like VSCode, you should get real-time code suggestions and tooltips where appropriate.

```js
/* Import all the usual stuff. This shouldn't be anything new. */
const { Client, MessageEmbed } = require('discord.js')
const { Menu } = require('discord.js-menu')
const client = new Client()

/* Run this code every time a new message is sent. */
client.on('message', message => {
    if (message.content === "!help") {
        /*
         * The menu class takes 4 parameters. 
         * 1) A channel to send the menu to
         * 2) A user ID to give control over the navigation, 
         * 3) An array of Page objects, each being a unique page of the menu
         * 4) How long, in milliseconds, you want the menu to wait for new reactions
         */
        let helpMenu = new Menu(message.channel, message.author.id, [
            {
                /*
                 * A page object consists of three items:
                 * 1) A name. This is used as a unique destination name for reactions.
                 * 2) Some content. This is a rich embed. 
                 * You can use {object: formatting} or .functionFormatting() for embeds. Whichever you prefer.
                 * 3) A set of reactions, linked to either a page destination or a function.* (See example pages)
                 * 
                 * Reactions can be emojis or custom emote IDs, and reaction destinations can be either the names
                 * of pages, () => { functions }, or special destination names. See below for a list of these.
                 */

                /* You can call pages whatever you like. The first in the array is always loaded first. */
                name: 'main',
                content: new MessageEmbed({
                    title: 'Help Menu',
                    description: 'This is some helpful info!',
                    fields: [
                        {
                            name: "Command: Ban",
                            value: "This command bans people.",
                            inline: true
                        }
                    ]
                }),
                reactions: {
                    '😳': 'extra',
                    '😀': async () => {
                        // You can run whatever you like in functions.
                        let res = await message.channel.send("Hey-")
                        setTimeout(() => {
                            return res.edit("listen!")
                        }, 1000)
                    }
                }
            },
            {
                name: 'extra',
                content: new MessageEmbed({
                    title: 'Extra menu',
                    description: 'This is another page.'
                }),
                reactions: {
                    /* You can use custom emotes by using their ID instead of an emoji. */
                    '711632156497019021': 'main',
                    '711840938303847401': 'delete',
                }
            }
        ], 300000)

        /* Run Menu.start() when you're ready to send the menu in chat.
         * Once sent, the menu will automatically handle everything else.
         */ 
        helpMenu.start()

        /* The menu also has a singular event you can use for, well, whatever you like.
         * The "pageChange" event fires just before a new page is sent. You can use
         * this to edit pages on the fly, or run some other logic.
         * It's your menu, man, do whatever.
         * 
         * The "destination" is the Page object it's about to change to.
         */
        helpMenu.on('pageChange', destination => {
            destination.content.title = "Hey, " + message.author.username
        })
    }
})

client.login("Get your bot's oauth token at https://discord.com/developers/applications")
```
You get the idea.

### Special Destinations
You may have noticed I mentioned "special destinations" above.   
Discord.js-menu comes with 6 pre-defined destinations with specific uses.

| Destination 	| Function                                                      	|
|-------------	|---------------------------------------------------------------	|
| first       	| Goes to the first page in the array.                          	|
| last        	| Goes to the last page in the array.                           	|
| previous    	| Goes to the previous page in the array.                       	|
| next        	| Goes to the next page in the array.                           	|
| stop        	| Removes reactions from the embed and stops updating the menu. 	|
| delete      	| Stops the menu and deletes the message.                       	|

Note that whilst calling a page one of these wouldn't break anything (the page would still be accessible using, ironically, the special destinations) you wouldn't be able to directly link to it.

### Contributing
Right now, the development pipeline is super simple. The [Standard](https://github.com/standard/standard) code style is used to keep styling consistent, but besides that, there's not much going on.  
Feel free to PR anything you think others would find useful. I'll gladly approve new contributions!

### Acknowledgements
Some parts of this project were inspired by Juby210's [discord.js-reaction-menu](https://github.com/Juby210/discord.js-reaction-menu).  
Thank you to Juby210 for releasing their code to the public and thus inspiring me to create my own implementation!
