const Command = require('../../types/MordCommand');

class PingCommand extends Command {
  constructor () {
    super('ping', {
      aliases: ['ping'],
      category: 'util',
      description: 'Displays round-trip and heartbeat latency.',
      details: 'Round-trip time is calculated by the difference between the ' +
        'time the user message was received by Discord and the time the bot ' +
        'response was received by Discord. Heartbeat latency is provided by ' +
        'the Discord websocket API, and is representative of the connection ' +
        'between the bot shard and the Discord server cluster it connects to.',
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
