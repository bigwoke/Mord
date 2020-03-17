const { Listener } = require('discord-akairo')
const log = require('../../log.js')

class ReadyListener extends Listener {
  constructor () {
    super('ready', {
      emitter: 'client',
      event: 'ready',
      type: 'once'
    })
  }

  exec () {
    log.info(`Connected to Discord as ${this.client.user.tag} (${this.client.user.id})`)
  }
}

module.exports = ReadyListener
