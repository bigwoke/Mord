const { AkairoClient, ListenerHandler } = require('discord-akairo')
const Data = require('../data.js')
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

    this.data = new Data();
    this.settings = this.data.settings
  }

  async login (token) {
    await this.settings.init()
    return super.login(token)
  }
}

module.exports = MordClient
