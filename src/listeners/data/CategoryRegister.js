const Listener = require('../../types/MordListener');
const log = require('../../helpers/log');

class CategoryRegisterListener extends Listener {
  constructor () {
    super('categoryRegister', {
      emitter: 'commandHandler',
      event: 'categoryRegister'
    });
  }

  exec (category) {
    log.verbose(`Category ${category.id} registered.`);
  }
}

module.exports = CategoryRegisterListener;
