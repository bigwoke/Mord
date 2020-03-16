const Command = require('../../MordCommand.js')

class PingCommand extends Command {
  constructor () {
    super('ping', {
      aliases: ['ping'],
      category: 'util',
      description: 'Displays round-trip and heartbeat latency.',
      cooldown: 5
    })
  }

  exec (message) {
    this.send(message, 'Pong!').then(sent => {
      const timeDiff =
        (sent.editedAt || sent.createdAt) -
        (message.editedAt || message.createdAt)
      return sent.edit('Pong!\n' +
        `🔂 **RTT**: ${timeDiff} ms\n` +
        `💟 **Heartbeat**: ${Math.round(this.client.ws.ping)} ms`)
    })
  }
}

module.exports = PingCommand
