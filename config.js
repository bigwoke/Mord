const config = {
  loglevel: {
    console: 'silly',
    file: 'debug'
  },
  db: {
    url: process.env.DB_URL,
    opts: { useNewUrlParser: true }
  },
  modules: {
    quotes: process.env.QUOTES === 'true'
  },
  token: process.env.TOKEN,
  googleapi: process.env.GOOGLE_API_KEY,
  prefix: process.env.PREFIX || '!'
}

module.exports = config
