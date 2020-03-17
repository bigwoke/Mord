const { Listener } = require('discord-akairo')
const log = require('../../../log.js')

class DebugListener extends Listener {
  constructor () {
    super('debug', {
      category: 'logging',
      emitter: 'client',
      event: 'debug'
    })
  }

  exec (message) {
    log.debug(message)
  }
}

module.exports = DebugListener
