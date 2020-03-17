const { AkairoClient, InhibitorHandler, ListenerHandler } = require('discord-akairo')
const MordCommandHandler = require('./MordCommandHandler.js')
const Data = require('../data.js')
const cfg = require('../config.js')

class MordClient extends AkairoClient {
  constructor () {
    super(
      { ownerID: cfg.client.ownerID },
      { disableMentions: 'everyone' }
    )

    this.commandHandler = new MordCommandHandler(this, {
      directory: './src/commands/',
      prefix: cfg.client.prefix,
      commandUtil: true,
      handleEdits: true,
      storeMessages: true
    })

    this.inhibitorHandler = new InhibitorHandler(this, { directory: './src/inhibitors/' })

    this.listenerHandler = new ListenerHandler(this, { directory: './src/listeners/' })

    this.commandHandler
      .useInhibitorHandler(this.inhibitorHandler)
      .useListenerHandler(this.listenerHandler)
      .loadAll()

    this.inhibitorHandler.loadAll()

    this.listenerHandler.setEmitters({
      commandHandler: this.commandHandler,
      inhibitorHandler: this.inhibitorHandler,
      listenerHandler: this.listenerHandler
    }).loadAll()

    this.data = new Data(this)
  }

  async setProvider (provider) {
    const newProvider = await provider
    this.provider = newProvider

    if (this.readyTimestamp) {
      await newProvider.init(this)
      return this.emit('debug', `Provider ${newProvider.constructor.name} initialized.`)
    }

    this.emit('debug', `Provider set to ${newProvider.constructor.name} - initializing once ready.`)
    await new Promise(resolve => {
      this.once('ready', () => {
        this.emit('debug', 'Initializing provider...')
        resolve(newProvider.init(this))
      })
    })
  }
}

module.exports = MordClient
