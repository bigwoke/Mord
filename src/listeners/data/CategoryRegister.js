const { Listener } = require('discord-akairo')
const log = require('../../../log.js')

class CategoryRegisterListener extends Listener {
  constructor () {
    super('categoryRegister', {
      emitter: 'commandHandler',
      event: 'categoryRegister'
    })
  }

  exec (category) {
    Object.defineProperty(category, 'disabledIn', { value: new Set(), writable: true })
    Object.defineProperty(category, 'globalEnabled', { value: true, writable: true })

    this.client.on('ready', () => {
      const { settings } = this.client

      settings.items.forEach(item => {
        const isDisabled = item.disabled_cat[category.id]
        if (isDisabled) category.disabledIn.add(item.id)
      })

      const disabledCategories = settings.get('global', 'disabled_cat')
      if (disabledCategories && disabledCategories[category.id]) {
        category.globalEnabled = false
      }
    })

    log.verbose(`Category ${category.id} registered.`)
  }
}

module.exports = CategoryRegisterListener
