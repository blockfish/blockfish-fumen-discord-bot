const kjfumen = require('tetris-fumen');
const Stacker = require('./stacker.js');

function toPage(stacker) {
    return {
        comment: quizString(stacker),
        field: kjfumen.Field.create(stacker.matrix.slice(0).reverse().join('')),
        flags: { quiz: true }
    };
}

function analysisToPages(ai, analysis, stacker) {
    let sugg = analysis.suggestions[0];
    let pages = [toPage(stacker)];
    for (let op of sugg.inputs) {
        if (op === 'hd') {
            stacker.apply('sd');
            pages.push({
                operation: stacker.piece,
                flags: { lock: true },
            });
        }
        stacker.apply(op);
    }
    let comment = ai.version
        + " | rating: " + sugg.rating
        + " (" + analysis.statistics.timeTaken + "s)";
    pages.push({ comment });
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
    if (quiz) {
        stacker.hold = quiz.hold;
        stacker.queue = quiz.current + quiz.queue;
    }
    return stacker;
}

function parseQuiz(comment) {
    if (!comment.startsWith("#Q=")) {
        return null;
    }

    let pos = 3;
    let hold = "";
    if (comment[pos] === "[") {
        let end = comment.indexOf("]", pos + 1);
        if (end === -1) {
            return null;
        }
        hold = filterValidMinos(comment.substring(pos + 1, end));
        pos = end + 1;
    }

    let rest = filterValidMinos(comment.substring(pos));
    let current = rest.substring(0, 1);
    let queue = rest.substring(1);

    return { hold, current, queue };
}

function quizString({ piece, queue, hold }) {
    let current;
    if (piece) {
        current = piece.type;
    } else {
        current = queue.substring(0, 1);
        queue = queue.substring(1);
    }
    return "#Q=[" + hold + "](" + current + ")" + queue;
}

function filterValidMinos(str) {
    let output = "";
    for (let c of str) {
        if ("LOJISZT".includes(c)) {
            output += c;
        }
    }
    return output;
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
