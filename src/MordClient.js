const { AkairoClient, ListenerHandler } = require('discord-akairo')
const cfg = require('../config.js')

class MordClient extends AkairoClient {
  constructor () {
    super({
      ownerID: cfg.client.ownerID
    }, {
      disableMentions: 'everyone'
    })

    this.listenerHandler = new ListenerHandler(this, {
      directory: './src/listeners/'
    })

    this.listenerHandler.loadAll()
  }
}

module.exports = MordClient
