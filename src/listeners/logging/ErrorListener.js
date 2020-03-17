const { Listener } = require('discord-akairo')
const log = require('../../../log.js')

class ErrorListener extends Listener {
  constructor () {
    super('error', {
      category: 'logging',
      emitter: 'client',
      event: 'error'
    })
  }

  exec (message) {
    log.error(message)
  }
}

module.exports = ErrorListener
