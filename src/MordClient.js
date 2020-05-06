const { AkairoClient, InhibitorHandler, ListenerHandler } = require('discord-akairo');
const MordCommandHandler = require('./types/MordCommandHandler');
const Data = require('./helpers/data');
const cfg = require('../config');

/**
 * Custom child class of AkairoClient. Sets
 * emitters, inhibitors, and commands, and adds
 * specified configuration including a custom
 * handler and data helper class.
 * @extends AkairoClient
 */
class MordClient extends AkairoClient {
  constructor () {
    super(
      { ownerID: cfg.client.ownerID },
      { disableMentions: 'everyone' }
    );

    /**
     * Data helper object containing setting provider and mongodb connection.
     * @type {Data}
     */
    this.data = new Data(this, Data.connect());

    /**
     * MongoDB settings provider instance for configuration persistence.
     * @type {MongoDBProvider}
     */
    this.settings = null;

    /**
     * Handler for listeners. Available via `handler` property in listeners.
     * @type {ListenerHandler}
     */
    this.listenerHandler = new ListenerHandler(this, {
      directory: './src/listeners/',
      automateCategories: true
    });

    /**
     * Handler for inhibitors, available via `handler` property in inhibitors.
     * @type {InhibitorHandler}
     */
    this.inhibitorHandler = new InhibitorHandler(this, {
      directory: './src/inhibitors/',
      automateCategories: true
    });

    /**
     * Custom handler for commands. Available via `handler` property in commands.
     * @type {MordCommandHandler}
     */
    this.commandHandler = new MordCommandHandler(this, {
      directory: './src/commands/',
      commandUtil: true,
      handleEdits: true,
      storeMessages: true,
      prefix: m => {
        const globalPrefix = this.settings.get('global', 'prefix');
        return m.channel.type === 'dm'
          ? ['', globalPrefix]
          : this.settings.get(m.guild.id, 'prefix', globalPrefix);
        },
      argumentDefaults: {
        prompt: {
          ended: 'Enough tries, done prompting.',
          cancel: 'Okay fine, I\'ll stop asking.',
          timeout: 'Try again when you\'re ready.'
        }
      }
    });

    this.on('dataReady', () => {
      this.configureHandlers();
      this.addArgumentTypes();
    });
    this.on('ready', () => this.data.setupCurrentGuilds());
  }

  /**
   * Prepares `data` and `settings` properties via connecting
   * to the database and linking data provider, then logs in.
   * @param {string} token - Discord API token.
   * @emits MordClient#dataReady - Data and settings are setup.
   */
  async login (token) {
    this.settings = await Data.linkProvider(this.data.db);
    this.settings.init();
    this.emit('dataReady');
    super.login(token);
  }

  /**
   * Loads all emitters, inhibitors, and commands. Also
   * links some relevant handlers with each other.
   */
  configureHandlers () {
    this.listenerHandler
      .setEmitters({
        commandHandler: this.commandHandler,
        inhibitorHandler: this.inhibitorHandler,
        listenerHandler: this.listenerHandler
      })
      .loadAll();

    this.inhibitorHandler
      .loadAll();

    this.commandHandler
      .useInhibitorHandler(this.inhibitorHandler)
      .useListenerHandler(this.listenerHandler)
      .loadAll();
  }

  /**
   * Adds custom argument types to the command handler TypeResolver.
   */
  addArgumentTypes () {
    this.commandHandler.resolver.addType('category', (message, phrase) => {
      if (!phrase) return null;
      return this.commandHandler.categories.get(phrase.toLowerCase());
    });
  }
}

module.exports = MordClient;
