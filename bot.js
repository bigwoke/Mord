/* eslint-disable no-magic-numbers, max-statements */

require('dotenv').config()
const Discord = require('discord.js')
const fs = require('fs')
const path = require('path')
const watch = require('node-watch')

const cfg = require('./config.js')
const log = require('./log.js')
const tools = require('./tools.js')
const db = require('./db.js')

const mord = new Discord.Client()

mord.commands = new Discord.Collection()
db.mountData(mord)

tools.getFiles('./commands/').then(files => {
  files = tools.flatArray(files)
  const cmds = files.filter(f => f.split('.').pop() === 'js')
  let count = 0

  cmds.forEach(file => {
    try {
      const cmd = require(path.resolve(file))

      if (!cmd.info || !cmd.run) {
        return log.warn(`Not loading ${file} because an issue was encountered.`)
      }
      if (cmd.info.module && cfg.modules[cmd.info.module] === false) {
        return log.debug(`Module '${cmd.info.module}' is disabled, will not load ${file}`)
      }
      if (cmd.info.dm && cmd.info.permissions) {
        return log.warn(`Command file ${file} has conflicting DM/permission attributes.`)
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

watch('./commands/', { filter: /\.js$/u, recursive: true }, (evt, file) => {
  const fileName = path.basename(file)

  const command = fileName.slice(0, -3) // eslint-disable-line no-magic-numbers
  mord.commands.delete(command)
  delete require.cache[require.resolve(path.resolve(file))]

  if (fs.existsSync(path.resolve(file))) { // eslint-disable-line no-sync
    try {
      const cmd = require(path.resolve(file))

      if (!cmd.info || !cmd.run) {
        return log.debug(`Cannot load ${file} because it is not a valid Mord command file.`)
      }
      if (cmd.info.module && cfg.modules[cmd.info.module] === false) {
        return log.debug(`Not autoloading ${file} because its module is disabled in config.`)
      }
      if (cmd.info.dm && cmd.info.permissions) {
        return log.warn(`Command file ${file} has conflicting DM/permission attributes.`)
      }

      log.info(`Auto-loaded ${path.relative('./commands/', file)}`)
      mord.commands.set(cmd.info.name, cmd)
    } catch (err) {
      log.warn(`Error autoloading ${file}: ${err.stack}`)
    }
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

  let args = msg.content.split(/\s+/ug)
  const rawcmd = args[0] // eslint-disable-line prefer-destructuring
  args = args.slice(1)

  const cmd = mord.commands.get(rawcmd.slice(cfg.prefix.length))
  if (!cmd) return
  if (!cmd.info.dm && msg.channel.type === 'dm') {
    return msg.reply('This command cannot be run via DM.')
  }

  if (msg.guild) {
    const authorPerms = msg.guild.members.find(m => m.user.id === msg.author.id).permissions.bitfield
    const hasPermission = cmd.info.permissions === 0 || (authorPerms & cmd.info.permissions) !== 0

    if (hasPermission) {
      cmd.run(mord, msg, args)
    } else {
      msg.reply('You lack the required permission to run this command.').then(resp => {
        resp.delete(3000)
        msg.delete(3000)
      })
    }
  } else {
    cmd.run(mord, msg, args)
  }
})

mord.login(cfg.token)
