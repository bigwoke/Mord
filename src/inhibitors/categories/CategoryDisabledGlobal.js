const Inhibitor = require('../../MordInhibitor.js')

class CategoryDisabledGlobalInhibitor extends Inhibitor {
  constructor () {
    super('categoryDisabledGlobal', {
      reason: 'categoryDisabledGlobal',
      priority: 4
    })
  }

  exec (message, command) {
    return !command.category.globalEnabled
  }
}

module.exports = CategoryDisabledGlobalInhibitor
