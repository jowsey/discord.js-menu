const { EventEmitter } = require('events')
const requiredPerms = ['SEND_MESSAGES', 'EMBED_LINKS', 'ADD_REACTIONS', 'MANAGE_MESSAGES']

/**
 * A page object that the menu can display.
 */
class Page {
  /**
    * Creates a menu page.
    * @param {string} name The name of this page, used as a destination for reactions.
    * @param {import('discord.js').MessageEmbed} content The MessageEmbed content of this page.
    * @param {Object.<string, string | function>} reactions The reactions that'll be added to this page.
    * @param {number} index The index of this page in the Menu
     */
  constructor (name, content, reactions, index) {
    this.name = name
    this.content = content
    this.reactions = reactions
    this.index = index
  }
}

/**
 * A menu with customisable reactions for every page.
 * Blacklisted page names are: `first, last, previous, next, stop, delete`.
 * These names perform special functions and should only be used as reaction destinations.
 */
module.exports.Menu = class extends EventEmitter {
  /**
    * Creates a menu.
    * @param {import('discord.js').TextChannel} channel The text channel you want to send the menu in.
    * @param {String} userID The ID of the user you want to let control the menu.
    * @param {Object[]} pages An array of page objects with a name, content MessageEmbed and a set of reactions with page names which lead to said pages.
    * @param {String} pages.name The page's name, used as a destination for reactions.
    * @param {import('discord.js').MessageEmbed} pages.content The page's embed content.
    * @param {Object.<string, string | function>} pages.reactions The reaction options that the page has.
    * @param {Number} ms The number of milliseconds the menu will collect reactions for before it stops to save resources. (seconds * 1000)
    *
    * @remarks
    * Blacklisted page names are: `first, last, previous, next, stop, delete`.
    * These names perform special functions and should only be used as reaction destinations.
    */
  constructor (channel, userID, pages, ms = 180000) {
    super()
    this.channel = channel
    this.userID = userID
    this.ms = ms

    const missingPerms = []
    // this usually means it's a dm channel that hasn't been created
    if (!this.channel) {
      this.channel.client.users.cache.get(this.userID).createDM(true)
    }
    if (this.channel.type !== 'dm') {
      requiredPerms.forEach(perm => {
        if (!this.channel.permissionsFor(this.channel.client.user).toArray().includes(perm)) {
          missingPerms.push(perm)
        }
      })
      if (missingPerms.length) console.log(`\x1B[96m[discord.js-menu]\x1B[0m Looks like you're missing ${missingPerms.join(', ')} in #${this.channel.name} (${this.channel.guild.name}). This perm is needed for basic menu operation. You'll probably experience problems sending menus in this channel.`)
    } else {
      console.log(`\x1B[96m[discord.js-menu]\x1B[0m Looks like you're trying to send a menu as a DM (to ${this.channel.recipient.tag}). DMs don't allow removing other people's reactions, making the menu fundamentally broken. The menu will still send, but you have been warned that what you're doing almost certainly won't work, so don't come complaining to me.`)
    }

    /**
     * List of pages available to the Menu.
     * @type {Page[]}
     */
    this.pages = []

    let i = 0
    pages.forEach(page => {
      this.pages.push(new Page(page.name, page.content, page.reactions, i))
      i++
    })

    /**
     * The page the Menu is currently displaying in chat.
     * @type {Page}
     */
    this.currentPage = this.pages[0]
    /**
     * The index of the Pages array we're currently on.
     * @type {Number}
     */
    this.pageIndex = 0
  }

  /**
   * Send the Menu and begin listening for reactions.
   */
  start () {
    // TODO: Sort out documenting this as a TSDoc event.
    this.emit('pageChange', this.currentPage)
    this.channel.send(this.currentPage.content).then(menu => {
      this.menu = menu
      this.addReactions()
      this.awaitReactions()
    }).catch(error => {
      if (this.channel.type === 'dm') {
        console.log(`\x1B[96m[discord.js-menu]\x1B[0m ${error.toString()} (whilst trying to send menu message in DMs) | The person you're trying to DM (${this.channel.client.users.cache.get(this.userID).tag}) probably has DMs turned off.`)
      } else {
        console.log(`\x1B[96m[discord.js-menu]\x1B[0m ${error.toString()} (whilst trying to send menu message) | You're probably missing 'SEND_MESSAGES' or 'EMBED_LINKS' in #${this.channel.name} (${this.channel.guild.name}), needed for sending the menu message.`)
      }
    })
  }

  /**
   * Stop listening for new reactions.
   */
  stop () {
    if (this.reactionCollector) {
      this.reactionCollector.stop()
      this.clearReactions()
    }
  }

  /**
   * Delete the menu message.
   */
  delete () {
    if (this.reactionCollector) this.reactionCollector.stop()
    if (this.menu) this.menu.delete()
  }

  /**
   * Remove all reactions from the menu message.
   */
  clearReactions () {
    if (this.menu) {
      return this.menu.reactions.removeAll().catch(error => {
        if (this.channel.type === 'dm') {
          console.log(`\x1B[96m[discord.js-menu]\x1B[0m ${error.toString()} (whilst trying to remove message reactions) | Told you so.`)
        } else {
          console.log(`\x1B[96m[discord.js-menu]\x1B[0m ${error.toString()} (whilst trying to remove message reactions) | You're probably missing 'MANAGE_MESSAGES' in #${this.channel.name} (${this.channel.guild.name}), needed for removing reactions when changing pages.`)
        }
      })
    }
  }

  /**
   * Jump to a new page in the Menu.
   * @param {Number} page The index of the page the Menu should jump to.
   */
  setPage (page = 0) {
    this.emit('pageChange', this.pages[page])

    this.pageIndex = page
    this.currentPage = this.pages[this.pageIndex]
    this.menu.edit(this.currentPage.content)

    this.reactionCollector.stop()
    this.addReactions()
    this.awaitReactions()
  }

  /**
   * React to the new page with all of it's defined reactions
   */
  addReactions () {
    for (const reaction in this.currentPage.reactions) {
      this.menu.react(reaction).catch(error => {
        if (error.toString().indexOf('Unknown Emoji') >= 0) {
          console.log(`\x1B[96m[discord.js-menu]\x1B[0m ${error.toString()} (whilst trying to add reactions to message) | The emoji you were trying to add to page "${this.currentPage.name}" (${reaction}) probably doesn't exist. You probably entered the ID wrong when adding a custom emoji.`)
        } else {
          console.log(`\x1B[96m[discord.js-menu]\x1B[0m ${error.toString()} (whilst trying to add reactions to message) | You're probably missing 'ADD_REACTIONS' in #${this.channel.name} (${this.channel.guild.name}), needed for adding reactions to the page.`)
        }
      })
    }
  }

  /**
   * Start a reaction collector and switch pages where required.
   */
  awaitReactions () {
    this.reactionCollector = this.menu.createReactionCollector((reaction, user) => user.id !== this.menu.client.user.id, { idle: this.ms })

    let sameReactions
    this.reactionCollector.on('end', (reactions) => {
      // Whether the end was triggered by pressing a reaction or the menu just ended.
      if (reactions) {
        return !sameReactions ? this.clearReactions() : reactions.array()[0].users.remove(this.menu.client.users.cache.get(this.userID))
      } else {
        return this.clearReactions()
      }
    })

    this.reactionCollector.on('collect', (reaction, user) => {
      // If the name exists, prioritise using that, otherwise, use the ID. If neither are in the list, don't run anything.
      const reactionName = Object.prototype.hasOwnProperty.call(this.currentPage.reactions, reaction.emoji.name)
        ? reaction.emoji.name
        : Object.prototype.hasOwnProperty.call(this.currentPage.reactions, reaction.emoji.id) ? reaction.emoji.id : null

      // If a 3rd party tries to add reactions or the reaction isn't registered, delete it.
      if (user.id !== this.userID || !Object.keys(this.currentPage.reactions).includes(reactionName)) {
        return reaction.users.remove(user)
      }

      if (reactionName) {
        if (typeof this.currentPage.reactions[reactionName] === 'function') {
          return this.currentPage.reactions[reactionName]()
        }

        switch (this.currentPage.reactions[reactionName]) {
          case 'first':
            sameReactions = JSON.stringify(this.menu.reactions.cache.keyArray()) === JSON.stringify(Object.keys(this.pages[0].reactions))
            this.setPage(0)
            break
          case 'last':
            sameReactions = JSON.stringify(this.menu.reactions.cache.keyArray()) === JSON.stringify(Object.keys(this.pages[this.pages.length - 1].reactions))
            this.setPage(this.pages.length - 1)
            break
          case 'previous':
            if (this.pageIndex > 0) {
              sameReactions = JSON.stringify(this.menu.reactions.cache.keyArray()) === JSON.stringify(Object.keys(this.pages[this.pageIndex - 1].reactions))
              this.setPage(this.pageIndex - 1)
            }
            break
          case 'next':
            if (this.pageIndex < this.pages.length - 1) {
              sameReactions = JSON.stringify(this.menu.reactions.cache.keyArray()) === JSON.stringify(Object.keys(this.pages[this.pageIndex + 1].reactions))
              this.setPage(this.pageIndex + 1)
            }
            break
          case 'stop':
            this.stop()
            break
          case 'delete':
            this.delete()
            break
          default:
            sameReactions = JSON.stringify(this.menu.reactions.cache.keyArray()) === JSON.stringify(Object.keys(this.pages.find(p => p.name === this.currentPage.reactions[reactionName]).reactions))
            this.setPage(this.pages.findIndex(p => p.name === this.currentPage.reactions[reactionName]))
            break
        }
      }
    })
  }
}
