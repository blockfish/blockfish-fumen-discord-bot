const kjfumen = require('tetris-fumen');
const Stacker = require('./stacker.js');

const flags = { lock: false, quiz: true };

function toPage(stacker) {
    let type = stacker.piece ? stacker.piece.type : "";
    let comment = "#Q=[" + stacker.hold + "](" + type + ")" + stacker.queue;
    let matrix = "";
    for (let row of stacker.matrix) {
        matrix = row + matrix;
    }
    let field = kjfumen.Field.create(matrix);
    return { comment, field, flags };
}

function analysisToPages(bf, analysis, stacker) {
    let sugg = analysis.suggestions[0];
    let pages = [];
    for (let op of sugg.inputs) {
        if (op === 'hd') {
            pages.push(toPage(stacker));
        }
        stacker.apply(op);
    }
    let comment = bf.version
        + " | rating: " + sugg.rating
        + " (" + analysis.statistics.timeTaken + "s)";
    pages.push({ ...toPage(stacker), comment });
    return pages;
}

function fromPage(page) {
    let stacker = new Stacker;
    let lines = page.field.str({
        reduced: true,
        separator: '\n',
    }).split('\n');
    lines.pop();
    stacker.matrix = lines.reverse();
    let quiz = page.comment && parseQuiz(page.comment);
    if (quiz !== null) {
        stacker.hold = quiz.hold;
        stacker.queue = quiz.current + quiz.queue;
    }
    return stacker;
}

function parseQuiz(comment) {
    if (!comment.startsWith("#Q=[")) {
        return null;
    }
    let pos = 4;
    let i = comment.indexOf("](", pos);
    if (i === -1) return null;
    let hold = comment.substring(pos, i);
    pos = i + 2;
    i = comment.indexOf(")", pos);
    if (i === -1) return null;
    let current = comment.substring(pos, i);
    let queue = comment.substring(i + 1);
    return { hold, current, queue };
}

const encode = kjfumen.encoder.encode;
const decode = kjfumen.decoder.decode;

module.exports = {
    toPage,
    analysisToPages,
    fromPage,
    encode,
    decode,
};
