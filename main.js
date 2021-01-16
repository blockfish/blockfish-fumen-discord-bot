const Bot = require('./src/bot.js');
const { env }  = require('process');

if (env.BOT_TOKEN === undefined) {
    console.error('BOT_TOKEN unset');
} else {
    new Bot(env.BOT_TOKEN);
}
