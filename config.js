/* eslint-disable no-process-env */
const config = {
  client: {
    token: process.env.TOKEN,
    prefix: process.env.PREFIX || '!',
    ownerID: process.env.OWNERID || ''
  },
  logging: {
    console: process.env.LOG_CONSOLE || 'silly',
    file: process.env.LOG_FILE
  }
}

module.exports = config
