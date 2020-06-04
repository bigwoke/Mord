const { CommandHandler } = require('discord-akairo');

/**
 * Wrapper class to add additional functionality to command handling.
 * @extends {CommandHandler}
 */
class MordCommandHandler extends CommandHandler {

  /**
   * Passes command registration to `CommandHandler#register`,
   * but also adds an emitter when a category is registered.
   * @param {Command} command - Command to register.
   * @param {string} filepath - Path to command file.
   */
  register (command, filepath) {
    const originalCategories = this.categories.clone();
    super.register(command, filepath);

    if (originalCategories.size < this.categories.size) {
      const diff = this.categories.difference(originalCategories);
      this.emit('categoryRegister', diff.first());
    }
  }
}

module.exports = MordCommandHandler;
