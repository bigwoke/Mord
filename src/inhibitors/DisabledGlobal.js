const Inhibitor = require('../MordInhibitor.js')

class DisabledGlobalInhibitor extends Inhibitor {
  constructor () {
    super('disabledGlobal', {
      reason: 'disabledGlobal',
      priority: 2
    })
  }

  exec (message, command) {
    return !command.globalEnabled
  }
}

module.exports = DisabledGlobalInhibitor
