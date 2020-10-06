<div align="center">
    <img src="https://i.imgur.com/c7vEVPS.png" width="580">
    <h4>Easily create Discord.js embed menus with reactions and unlimited customisable pages.</h4>
    <h4>Need help? Join the support server! https://discord.gg/VBDhRc8</h4>
    <a href="https://nodei.co/npm/discord.js-menu/"><img src="https://nodei.co/npm/discord.js-menu.png"></a><br>
    <img alt="npm" src="https://img.shields.io/npm/dw/discord.js-menu">
    <img alt="npm" src="https://img.shields.io/npm/dt/discord.js-menu">
    <img alt="npm (prod) dependency version" src="https://img.shields.io/npm/dependency-version/discord.js-menu/discord.js">
</div>

### Installation
In your project directory:
```bash
npm install discord.js-menu
```
In your code:
```js
const { Menu } = require('discord.js-menu');
```
It's as easy as that!

### Basic Example
This is one of the simplest menus you can make. It's two set pages that you can alternate between, nothing fancy.
Hopefully, it should provide a good first look into how you can create reaction menus with the library.

```js
const { Client, MessageEmbed } = require('discord.js')
const { Menu } = require('discord.js-menu')
const client = new Client()

client.on('message', message => {
    if (message.content === "!help") {
        // Provide a menu with a channel, an author ID to let control the menu, and an array of menu pages.
        let helpMenu = new Menu(message.channel, message.author.id, [
            // Each object in this array is a unique page.
            {
                // A page object consists of a name, used as a destination by reactions...
                name: 'main',
                // A MessageEmbed to actually send in chat, and...
                content: new MessageEmbed({
                    title: 'Help Menu',
                    description: 'This is some helpful info!'
                }),
                // A set of reactions with destination names attached.
                // Note there's also special destination names (read below)
                reactions: {
                    '⏹': 'delete',
                    '▶': 'extra'
                }
            },
            {
                name: 'extra',
                content: new MessageEmbed({
                    title: 'Extra menu',
                    description: 'This is another page. You can have as many of these as you want.'
                }),
                reactions: {
                    '◀': 'first'
                }
            }
            // The last parameter is the number of milliseconds you want the menu to collect reactions for each page before it stops to save resources
            // The timer is reset when a user interacts with the menu.
            // This is optional, and defaults to 180000 (3 minutes).
        ], 300000)
        // Run Menu.start() when you're ready to send the menu in chat.
        // Once sent, the menu will automatically handle everything else.
        helpMenu.start()
    }
})

client.login("your_token")
```
This is a relatively small menu, at only 2 pages. You could theoretically create an unlimited amount of them if you needed to.

### Special Destinations
Every page object has three items: a `name`, which is used as a destination for your reactions, the `content` (a MessageEmbed), and a set of `reactions` for that page.  
In the `reactions` object, each key is an emoji, and its value a destination you have set. Every page's name is a destination, but there are also 6 other destinations that serve various functions.  

**first** - Goes to the first page in the array.  
**last** - Goes to the last page in the array.  
**previous** - Goes to the previous page in the array.  
**next** - Goes to the next page in the array.  
**stop** - Removes the reactions and stops updating the menu.  
**delete** - Stops the menu and deletes the message.

Note that whilst calling a page one of these wouldn't break anything (the page would still be accessible using, for example, the `next` and `previous` destinations) you wouldn't be able to directly link to it.

### Events and dynamic pages
New to v2.0.0 is the ability to create pages that can be entirely unique and dynamic.  
v2.0.0 adds the "pageChange" event to the Menu class, which fires just before the message actually edits, meaning you can edit the page with any variables you want before it gets fed into the menu.
Here's an example of creating a menu page based on a user's profile info.
```js
/* -- assume boilerplate code here -- */
client.on('message', message => {
    let userMenu = new Menu(message.channel, message.author.id, [
        {
            name: 'user',
            content: new MessageEmbed({
                title: "Your user info!",
                color: 0x7289DA
            })
        }
    ], 300000)
    userMenu.start()

    userMenu.on('pageChange', destination => {
        if (destination.name === "user") {
            destination.content.description = message.author.username + "'s info:"
            destination.content.addField('Avatar URL:', message.author.avatarURL())
            destination.content.addField('Are you a bot?', message.author.bot ? "Yes!" : "No...")
        }
    })
})
```
And there you have it, a custom menu page just for you!   
Now, of course one lone page isn't all that exciting - that's why we have reaction menus! Why not expand the menu into a full dashboard of user data with multiple areas? Remember, you can also dynamically edit the `destination.reactions` and `destination.name` if you'd like to spice things up a little.
  
I'm well aware this is still a bit of a janky workaround for some cases, and I'm working on making this more streamlined.

### Custom emojis as reactions
You can now add custom emojis as reactions by substituting the emoji symbol (eg: 😳) for the ID of the emoji (eg: 745849372638471028).  
I've tested this and confirmed it works, but please do create an issue if you have any issues with custom emojis.

### Acknowledgements
This project was heavily inspired by Juby210's [discord.js-reaction-menu](https://github.com/Juby210/discord.js-reaction-menu).  
It's a great project, and I was originally using it, but in the end, creating my own version seemed more worthwhile. Much respect to Juby210, though!
