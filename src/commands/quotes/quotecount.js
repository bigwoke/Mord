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

  async exec (message) {
    const count = await this.client.data.getQuoteCount(message.guild);
    const latest = await this.client.data.getLatestQuote(message.guild);
    const { name } = message.guild;

    if (!latest || !latest.number) {
      this.send(message, `No quotes registered in ${name}!`);
      return;
    }

    const response =
      `Total quotes registered so far in ${name}: **${count}**` +
      `\nLatest (highest) quote number: **${latest.number}**`;

    this.send(message, response);
  }
}

module.exports = QuoteCountCommand;
