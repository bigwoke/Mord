require('dotenv').config()
const Discord = require('discord.js')
const fs = require('fs')
const path = require('path')
const watch = require('node-watch')

const cfg = require('./config.js')
const log = require('./log.js')
const tools = require('./tools.js')

const mord = new Discord.Client()
mord.commands = new Discord.Collection()

tools.getFiles('./commands/').then(files => {
  files = tools.flatArray(files)
  let cmds = files.filter(f => f.split('.').pop() === 'js')
  let count = 0

  cmds.forEach(file => {
    try {
      let cmd = require(path.resolve(file))
      if (!cmd.info || !cmd.run) {
        return log.warn(`Not loading ${file} because an issue was encountered.`)
      }
      if (cmd.info.module && cfg.modules[cmd.info.module] === false) {
        return log.debug(`Module '${cmd.info.module}' is disabled, will not load ${file}`)
      }
      count++

      log.verbose(`${count}: Loaded ${path.relative('./commands/', file)}`)
      mord.commands.set(cmd.info.name, cmd)
    } catch (err) {
      log.warn(`Error loading ${file}: ${err.stack}`)
    }
  })
  log.info(`Loaded ${count} commands.`)
})

watch('./commands/', { filter: /\.js$/, recursive: true }, (evt, file) => {
  let fileName = path.basename(file)
  delRequireCache(file, fileName)

  if (fs.existsSync(path.resolve(file))) {
    try {
      let cmd = require(path.resolve(file))

      if (!cmd.info || !cmd.run) {
        return log.debug(`Cannot load ${file} because it is not a valid Mord command file.`)
      }
      if (cmd.info.module && cfg.modules[cmd.info.module] === false) {
        return log.debug(`Not autoloading ${file} because its module is disabled in config.`)
      }

      log.info(`Auto-loaded ${path.relative('./commands/', file)}`)
      mord.commands.set(cmd.info.name, cmd)
    } catch (err) {
      log.warn(`Error autoloading ${file}: ${err.stack}`)
    }
  }

  function delRequireCache (file, name) {
    let cmd = name.slice(0, -3)
    mord.commands.delete(cmd)
    delete require.cache[require.resolve(path.resolve(file))]
  }
})

mord.on('ready', () => {
  log.info(`Client connected and logged in as ${mord.user.tag}`)
})

mord.on('error', err => {
  log.error('Error: ', err.stack)
})

mord.on('message', msg => {
  if (msg.author.bot) return
  if (!msg.content.startsWith(cfg.prefix)) return

  let args = msg.content.split(/\s+/g)
  let rawcmd = args[0]
  args = args.slice(1)

  let cmd = mord.commands.get(rawcmd.slice(cfg.prefix.length))
  if (!cmd) return
  if (!cmd.info.dm) return msg.reply('This command cannot be run via DM.')

  // Check permissions here

  cmd.run(mord, msg, args)
})

mord.login(cfg.token)
