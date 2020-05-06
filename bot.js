require('dotenv').config();
const MordClient = require('./src/MordClient');
const cfg = require('./config');

const client = new MordClient();
client.login(cfg.client.token);
