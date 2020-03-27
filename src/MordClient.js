const { AkairoClient, InhibitorHandler, ListenerHandler } = require('discord-akairo')
const MordCommandHandler = require('./MordCommandHandler.js')
const Data = require('../data.js')
const cfg = require('../config.js')

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
    )

    /**
     * Data helper object containing setting provider and mongodb connection.
     * @type {Data}
     */
    this.data = null

    /**
     * MongoDB settings provider instance for configuration persistence.
     * @type {MongoDBProvider}
     */
    this.settings = null

    /**
     * Handler for listeners. Available via `handler` property in listeners.
     * @type {ListenerHandler}
     */
    this.listenerHandler = new ListenerHandler(this, { directory: './src/listeners/' })

    /**
     * Handler for inhibitors, available via `handler` property in inhibitors.
     * @type {InhibitorHandler}
     */
    this.inhibitorHandler = new InhibitorHandler(this, { directory: './src/inhibitors/' })

    /**
     * Custom handler for commands. Available via `handler` property in commands.
     * @type {MordCommandHandler}
     */
    this.commandHandler = new MordCommandHandler(this, {
      directory: './src/commands/',
      prefix: cfg.client.prefix,
      commandUtil: true,
      handleEdits: true,
      storeMessages: true,
      argumentDefaults: {
        prompt: {
          ended: 'Enough tries, done prompting.',
          cancel: 'Okay fine, I\'ll stop asking.',
          timeout: 'Try again when you\'re ready.'
        }
      }
    })

    this.setupData()
    this.on('dataReady', () => this.configureHandlers())
    this.on('ready', () => this.data.loadDefaults())
  }

  /**
   * Prepares `data` and `settings` properties via
   * connecting to the database and linking data provider.
   * @emits MordClient#dataReady - Data and settings are setup.
   */
  async setupData () {
    this.data = await new Data()
    Object.defineProperty(this.data, 'client', { value: this })
    this.settings = await Data.linkProvider(this.data._db)
    this.settings.init()
    this.emit('dataReady')
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
      .loadAll()

    this.inhibitorHandler
      .loadAll()

    this.commandHandler
      .useInhibitorHandler(this.inhibitorHandler)
      .useListenerHandler(this.listenerHandler)
      .loadAll()
  }
}

module.exports = MordClient
