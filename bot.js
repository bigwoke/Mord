require('dotenv').config();
const MordClient = require('./src/MordClient.js');
const cfg = require('./config.js');

const client = new MordClient();
client.login(cfg.client.token);
