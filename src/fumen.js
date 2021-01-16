const kjfumen = require('tetris-fumen');

const flags = { lock: false };

function page(stacker) {
    let type = stacker.piece ? stacker.piece.type : "";
    let comment = "#Q=[" + stacker.hold + "](" + type + ")" + stacker.queue;
    let matrix = "";
    for (let row of stacker.matrix) {
        matrix = row + matrix;
    }
    let field = kjfumen.Field.create(matrix);
    return { comment, field, flags };
}

function analysis(bf, analysis, stacker) {
    let sugg = analysis.suggestions[0];
    let pages = [];
    stacker = stacker.copy();
    for (let op of sugg.inputs) {
        if (op === 'hd') {
            pages.push(page(stacker));
        }
        stacker.apply(op);
    }
    let comment = bf.version
        + " | rating: " + sugg.rating
        + " (" + analysis.statistics.timeTaken + "s)";
    pages.push({ ...page(stacker), comment });
    return pages;
}

const encode = kjfumen.encoder.encode;
const decode = kjfumen.decoder.decode;

module.exports = { page, analysis, encode, decode };
