const blockfish = require('blockfish');
const ruleset = require('./ruleset.json');
const Stacker = require('./stacker.js');
const fumen = require('./fumen.js');

class Cheese {
    constructor() {
        Object.assign(this, { prev: null });
    }

    line() {
        let col;
        if (this.prev === null) {
            col = Math.floor(Math.random() * ruleset.cols);
        } else {
            col = Math.floor(Math.random() * (ruleset.cols - 1));
            col = (this.prev + col + 1) % ruleset.cols;
        }
        let line = "";
        for (let i = 0; i < ruleset.cols; i++) {
            line += (i == col) ? '_' : 'X';
        }
        this.prev = col;
        return line;
    }
}

class RandomBag {
    constructor() {
        Object.assign(this, {
            bag: Object.keys(ruleset.shapes),
        });
    }

    shuffle() {
        for (let i = 1; i < this.bag.length; i++) {
            let j = i + Math.floor(Math.random() * (this.bag.length - i));
            let tmp = this.bag[i - 1];
            this.bag[i - 1] = this.bag[j];
            this.bag[j] = tmp;
        }
        return this.bag.join('');
    }
}

module.exports.main = () => {
    let bs = new Stacker;
    let cheese = new Cheese;
    for (var i = 0; i < 9; i++) {
        bs.matrix.unshift(cheese.line());
    }
    bs.queue = (new RandomBag).shuffle();
    let bf = new blockfish.AI;
    bf.analyze(bs, { node_limit: 200000 }, ana => {
        console.log(fumen.encode(fumen.analysis(bf, ana, bs)));
        bf.kill();
    });
};
