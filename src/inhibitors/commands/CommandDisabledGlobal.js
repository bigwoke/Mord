const Inhibitor = require('../../MordInhibitor.js')

class CommandDisabledGlobalInhibitor extends Inhibitor {
  constructor () {
    super('commandDisabledGlobal', {
      reason: 'commandDisabledGlobal',
      priority: 3
    })
  }

  exec (message, command) {
    return !command.globalEnabled
  }
}

module.exports = CommandDisabledGlobalInhibitor
