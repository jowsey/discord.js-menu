const { TextChannel } = require('discord.js');

/**
 * Create a menu with customisable reactions for every page.
 * Blacklisted page names are: `first, last, previous, next, stop`.
 * Each name, when set to a reaction value, will do as you expect it to.
 * Stop deletes the menu message.
 * @param channel The text channel you want to send the menu in.
 * @param userID The ID of the user you want to let control the menu.
 * @param pages An array of page objects with a name, content MessageEmbed and a set of reactions with page names which lead to said pages.
 */

module.exports.Menu = class {
    constructor(channel = new TextChannel(), userID, pages = [{name: "main", content: new MessageEmbed().setTitle("Discord.js-Menu Default Page").setLink("https://npm.im/discord.js-menu"), reactions: {"⏹": "stop"}}]) {
        this.channel = channel;
        this.userID = userID;
        this.pages = pages;
        this.currentPage = pages[0];
        this.page = 0;

        channel.send(this.currentPage.content).then(menu => {
            this.menu = menu;
            this.react();
            this.awaitReactions();
        });
    }
    setPage(page = 0) {
        this.page = page;
        this.currentPage = this.pages[this.page];
        this.menu.edit(this.currentPage.content);
        
        this.menu.reactions.removeAll();
        this.reactionCollector.stop();
        this.react();
        this.awaitReactions();
    }
    react() {
        for(const reaction in this.currentPage.reactions) {
            this.menu.react(reaction);
        }
    }
    awaitReactions() {
        this.reactionCollector = this.menu.createReactionCollector((reaction, user) => user.id == this.userID, {time: 180000});
        this.reactionCollector.on('collect', reaction => {
            if (this.currentPage.reactions.hasOwnProperty(reaction.emoji.name)) {
                let destination = this.currentPage.reactions[reaction.emoji.name];
                switch (destination) {
                    case "first":
                        this.setPage(0);
                        break;
                    case "last":
                        this.setPage(this.pages.length - 1);
                        break;
                    case "previous":
                        if (this.page > 0) {
                            this.setPage(this.page - 1);
                        }
                        break;
                    case "next":
                        if (this.page < this.pages.length - 1) {
                            this.setPage(this.page + 1);
                        }
                        break;
                    case "stop":
                        this.reactionCollector.stop();
                        this.menu.delete();
                        break;
                    default:
                        this.setPage(this.pages.findIndex(p => p.name == destination));
                        break;
                }
            }
        });
    }
}