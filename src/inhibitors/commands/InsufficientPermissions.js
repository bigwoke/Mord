const Inhibitor = require('../../types/MordInhibitor');

class InsufficientPermissionsInhibitor extends Inhibitor {
  constructor () {
    super('insufficientPermissions', {
      reason: 'insufficientPermissions'
    });
  }

  exec (message, command) {
    if (!message.member && !this.client.isOwner(message.author)) return true;
    if (message.member && command.userPermissions &&
      !message.member.hasPermission(command.userPermissions)) return true;
  }
}

module.exports = InsufficientPermissionsInhibitor;
