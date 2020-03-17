const { Listener } = require('discord-akairo')
const log = require('../../../log.js')

class WarnListener extends Listener {
  constructor () {
    super('warn', {
      category: 'logging',
      emitter: 'client',
      event: 'warn'
    })
  }

  exec (message) {
    log.warn(message)
  }
}

module.exports = WarnListener
