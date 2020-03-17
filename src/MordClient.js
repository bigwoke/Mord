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

    this.data = new Data().connect()
    this.settings = Data.linkProvider(this.data)

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
  }

  login (token) {
    this.settings.then(super.login(token))
  }
}

module.exports = MordClient
