const { Listener } = require('discord-akairo')
const log = require('../../log.js')

class DebugListener extends Listener {
  constructor () {
    super('debug', {
      emitter: 'client',
      event: 'debug'
    })
  }

  exec (message) {
    log.debug(message)
  }
}

module.exports = DebugListener
