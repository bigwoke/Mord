const config = {
  loglevel: {
    console: 'silly',
    file: 'debug'
  },
  db: {
    name: process.env.DB_NAME || 'Mord',
    url: process.env.DB_URL,
    opts: { useNewUrlParser: true }
  },
  token: process.env.TOKEN,
  prefix: process.env.PREFIX || '!'
}

module.exports = config
