const Inhibitor = require('../../MordInhibitor.js')

class CategoryDisabledGlobalInhibitor extends Inhibitor {
  constructor () {
    super('categoryDisabledGlobal', {
      reason: 'categoryDisabledGlobal',
      priority: 4
    })
  }

  exec (message, command) {
    const disabledCategories = this.client.settings.get('global', 'disabled_cat')
    return disabledCategories[command.category.id] === true
  }
}

module.exports = CategoryDisabledGlobalInhibitor
