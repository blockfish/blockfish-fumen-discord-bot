const blockfish = require('blockfish');
const discord = require('discord.js');
const fumen = require('./fumen.js');

const FISH = "\u{1f41f}";

const AI_CONFIG = {
    nodeLimit: 100000,
    suggestionLimit: 1,
};

class Bot {
    constructor(token) {
        Object.assign(this, {
            client: new discord.Client,
            ai: new blockfish.AI,
        });
        this.client.on('ready', this._onReady.bind(this));
        this.client.on('message', this._onMessage.bind(this));
        this.client.login(token);
    }

    _onReady() {
        console.log(this.client.user);
    }

    _onMessage(msg) {
        let command = msg.content && parseCommand(msg.content);
        if (!command) {
            return;
        }
        switch (command.type) {
        case 'fumen':
            this._fumen(command.data, replyContents => msg.reply(replyContents));
            break;

        default:
            break;
        }
    }

    _fumen(data, callback) {
        try {
            let pages = fumen.decode(data);
            let stacker = fumen.fromPage(pages[0]);
            this.ai.analyze(stacker, AI_CONFIG, analysis => {
                let solution = fumen.analysisToPages(this.ai, analysis, stacker);
                callback(`http://fumen.zui.jp/?${fumen.encode(solution)}`);
            });
        } catch (e) {
            console.error(e);
        }
    }
}

function parseCommand(msg) {
    let payload;
    if (msg.startsWith(':fish ')) {
        payload = msg.substring(6);
    } else if (msg.startsWith(FISH)) {
        payload = msg.substring(FISH.length);
    } else {
        return null;
    }
    let data = payload.trim();
    if (data.length === 0) {
        return null;
    }
    return { type: 'fumen', data };
}

module.exports = Bot;
