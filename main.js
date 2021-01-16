const { botToken } = require('./tokens.json');
const Bot = require('./src/bot.js');
new Bot(botToken);
