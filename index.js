const bf = require('blockfish');

let ai = new bf.AI;

ai.on('init', motd => {
    console.log("** blockfish version: " + ai.version + " **");
});

let ss = {
    queue: 'LOJI',
    matrix: [
        'XXXXX_XXXXX',
        'X_XXXXXXXXX'
    ],
};

let cfg = {
    node_limit: 5000,
};

ai.analyze(ss, cfg, result => {
    console.log(result);
    ai.kill();
});
