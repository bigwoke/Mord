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

    this.listenerHandler.setEmitters({
      listenerHandler: this.listenerHandler
    }).loadAll()

    this.data = new Data(this)
  }

  login (token) {
    return super.login(token)
  }

  async setProvider (provider) {
    const newProvider = await provider
    this.provider = newProvider

    if (this.readyTimestamp) {
      await newProvider.init(this);
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
