const Command = require('../../types/MordCommand.js');

class PingCommand extends Command {
  constructor () {
    super('ping', {
      aliases: ['ping'],
      category: 'util',
      description: 'Displays round-trip and heartbeat latency.',
      destruct: 5000,
      cooldown: 5000
    });
  }

  exec (message) {
    return this.send(message, 'Pong!').then(sent => {
      const timeDiff =
        (sent.editedAt || sent.createdAt) -
        (message.editedAt || message.createdAt);
      return this.send(message, [
        'Pong!',
        `🔂 **RTT**: ${timeDiff} ms`,
        `💟 **Heartbeat**: ${Math.round(this.client.ws.ping)} ms`
      ]);
    });
  }
}

module.exports = PingCommand;
