const Listener = require('../../types/MordListener.js')
const log = require('../../helpers/log.js')

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
