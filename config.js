/* eslint-disable no-process-env */
const config = {
  client: {
    token: process.env.TOKEN,
    prefix: process.env.PREFIX || '!',
    ownerID: process.env.OWNERID || ''
  },
  logging: {
    console: process.env.LOG_CONSOLE || 'info',
    file: process.env.LOG_FILE
  },
  db: {
    url: process.env.DB_URL,
    name: process.env.DB_NAME || 'settings',
    opts: { useNewUrlParser: true, useUnifiedTopology: true }
  }
}

module.exports = config
