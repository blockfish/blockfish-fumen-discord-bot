const blockfish = require('blockfish');
const Stacker = require('./stacker.js');
const fumen = require('./fumen.js');

module.exports.main = () => {
    let pages = fumen.decode(
        'v115@zgB8AeO8AeG8AeG8AeH8AeF8JeAgWaAFLDmClcJSAV?DEHBEooRBToAVB0SFgC6/AAA'
    );
    let bs = fumen.fromPage(pages[0]);
    let bf = new blockfish.AI;
    bf.analyze(bs, { node_limit: 200000 }, ana => {
        console.log(fumen.encode(fumen.analysisToPages(bf, ana, bs)));
        bf.kill();
    });
};
