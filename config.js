/* eslint no-process-env: 0 */
const config = {
  loglevel: {
    console: 'silly',
    file: 'debug'
  },
  client: {
    prefix: process.env.PREFIX || '!',
    ownerid: process.env.OWNERID || ''
  },
  token: process.env.TOKEN,
  googleapi: process.env.GOOGLE_API_KEY,
  prefix: process.env.PREFIX || '!'
};

module.exports = config;