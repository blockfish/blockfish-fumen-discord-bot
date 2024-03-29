const blockfish = require('blockfish');
const discord = require('discord.js');
const fumen = require('./fumen.js');

const FISH = "\u{1f41f}";
const FUMEN_SITE = "http://harddrop.com/fumen/";
const MAX_URL_LENGTH = 400;
const AI_CONFIG = {
    nodeLimit: 300000,
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

    _onDiscordError(err) {
        console.error(err);
    }

    _onMessage(msg) {
        let command = msg.content && parseCommand(msg.content);
        if (!command) {
            return;
        }

        switch (command.type) {
        case 'fumen':
            this._fumen(command, replyContents => {
                msg.reply(replyContents)
                    .catch(this._onDiscordError.bind(this))
            });
            break;

        default:
            break;
        }
    }

    _fumen({ pages }, callback) {
        try {
            let stacker = null;
            for (let page of pages) {
                stacker = fumen.fromPage(page);
                if (stacker.queue !== '' || stacker.hold !== '') {
                    break;
                }
            }
            this.ai.analyze(stacker, AI_CONFIG, analysis => {
                if (analysis.suggestions.length > 0) {
                    let solution = fumen.analysisToPages(this.ai, analysis, stacker);
                    let url = `${FUMEN_SITE}?${fumen.encode(solution)}`;
                    shortenIfTooLong(url, callback);
                }
            });
        } catch (e) {
            console.error(e);
        }
    }
}

function parseCommand(msg) {
    if (msg.startsWith(FISH)) {
        try {
            let pages = fumen.decode(msg.substring(FISH.length).trim());
            return { type: 'fumen', pages };
        } catch (e) {
            return null;
        }
    }
    return null;
}

function shortenIfTooLong(url, callback) {
    if (url.length >= MAX_URL_LENGTH) {
        require('turl').shorten(url).then(callback);
    } else {
        return callback(url);
    }
}

module.exports = Bot;
