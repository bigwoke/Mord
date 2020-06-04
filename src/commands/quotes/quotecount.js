const Command = require('../../types/MordCommand');

class QuoteCountCommand extends Command {
  constructor () {
    super('quotecount', {
      aliases: ['quotecount', 'quotes'],
      category: 'quotes',
      channel: 'guild',
      description: 'Gives a count of quotes for a guild.',
      details: 'Returns an estimated count (based on accurate database metadata) ' +
        'of quotes that the current guild has accrued over time.',
      destruct: 15000,
      cooldown: 15000,
      examples: [
        {
          text: 'quotes'
        }
      ]
    });
  }

  exec (message) {
    this.client.data.getQuoteCount(message.guild).then(count => {
      const { name } = message.guild;
      this.send(message, `Quotes registered so far in ${name}: **${count}**`);
    });
  }
}

module.exports = QuoteCountCommand;
