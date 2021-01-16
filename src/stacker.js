const ruleset = require('./ruleset.json');

class Stacker {
    constructor({ queue, hold, matrix }) {
        Object.assign(this, {
            matrix: matrix || [],
            hold: hold || "",
            queue: queue || "",
            piece: null,
        });
    }

    spawn() {
        let { queue } = this;
        if (queue === "") {
            return null;
        }
        let type = queue[0];
        let [x, y] = ruleset.shapes[type].spawn;
        let rotation = 'spawn';
        this.piece = { type, x, y, rotation };
        this.queue = queue.substring(1);
        return type;
    }

    apply(op) {
        if (this.piece === null && !this.spawn()) {
            return null;
        }

        switch (op) {
        case 'left':
        case 'right':
            {
                // horizontal movement
                let dx = op == 'left' ? -1 : +1;
                let dy = 0;
                let spin = 'no';
                return this._transform([ { dx, dy, spin }]);
            }

        case 'ccw':
        case 'cw':
            {
                // rotation
                let { type, rotation } = this.piece;
                let spin = op;
                let r0 = ROTATE_INDEX[rotation];
                let r1 = ROTATE_INDEX[ROTATE[rotation][spin]];
                let kicks = ruleset.shapes[type].kicks[spin][r0][r1];
                return this._transform(kicks.map(([dx, dy]) => ({ dx, dy, spin })));
            }

        case 'sd':
        case 'hd':
            {
                // sonic drop
                let dy = 0;
                while (!this._pieceIntersects()) {
                    this.piece.y -= 1;
                    dy += 1;
                }
                this.piece.y += 1;
                if (op === 'hd') {
                    this._lock();
                }
                return dy;
            }
            break;

        case 'hold':
            {
                let hold = this.hold;
                this.hold = this.piece.type;
                if (hold !== null) {
                    this.queue = hold + this.queue;
                }
                this.spawn();
                return true;
            }
            break;
        }
    }

    _transform(tfs) {
        let { piece: { x, y, rotation } } = this;
        let attempt = 0;
        for (let { dx, dy, spin } of tfs) {
            attempt++;
            this.piece.x = x + dx;
            this.piece.y = y + dy;
            this.piece.rotation = ROTATE[rotation][spin];
            if (!this._pieceIntersects()) {
                return attempt;
            }
        }
        // reset since all attempts failed
        this.piece.x = x;
        this.piece.y = y;
        this.piece.rotation = rotation;
        return null;
    }

    _pieceIntersects() {
        let { x, y } = this.piece;
        return minoOffsets(this.piece).some(([dx, dy]) => {
            return this._getMatrix(x + dx, y + dy) != '_';
        });
    }

    _lock() {
        let { type, x, y } = this.piece;
        for (let [dx, dy] of minoOffsets(this.piece)) {
            this._setMatrix(x + dx, y + dy, type);
        }
        this.sift();
        this.spawn();
    }

    _getMatrix(x, y) {
        if (x < 0 || x >= ruleset.cols || y < 0) {
            return 'X';
        } else if (y >= this.matrix.length) {
            return '_';
        } else {
            return this.matrix[y][x];
        }
    }

    _setMatrix(x, y, c) {
        if (x < 0 || x >= ruleset.cols || y < 0) {
            throw new Error('_setMatrix() invalid position');
        }
        while (y >= this.matrix.length) {
            this.matrix.push(EMPTY_ROW);
        }
        let row = this.matrix[y];
        this.matrix[y] = row.substring(0, x) + c + row.substring(x + 1);
    }

    sift() {
        for (let y = 0; y < this.matrix.length; y++) {
            if (!this.matrix[y].includes('_')) {
                this.matrix.splice(y, 1);
                y -= 1;
            }
        }
    }
}

const ROTATE = {
    'spawn': {
        'no': 'spawn',
        'cw': 'right',
        'ccw': 'left',
    },
    'right': {
        'no': 'right',
        'cw': 'reverse',
        'ccw': 'spawn',
    },
    'reverse': {
        'no': 'reverse',
        'cw': 'left',
        'ccw': 'right',
    },
    'left': {
        'no': 'left',
        'cw': 'spawn',
        'ccw': 'reverse',
    },
};

const ROTATE_INDEX = {
    'spawn': 0,
    'right': 1,
    'reverse': 2,
    'left': 3,
};

// TODO: use a generator?
function minoOffsets({ type, rotation }) {
    let { coords, width: w } = ruleset.shapes[type];
    return coords.map(([x, y]) => {
        let dx, dy;
        switch (rotation) {
        case 'spawn':
            dx = x;
            dy = y;
            break;
        case 'right':
            dx = y;
            dy = w - x - 1;
            break;
        case 'reverse':
            dx = w - x - 1;
            dy = w - y - 1;
            break;
        case 'left':
            dx = w - y - 1;
            dy = x;
            break;
        }
        return [dx, dy];
    });
}

function makeEmptyRow() {
    let emptyRow = '';
    while (emptyRow.length < ruleset.cols) {
        emptyRow += '_';
    }
    return emptyRow;
}

const EMPTY_ROW = makeEmptyRow();

module.exports = Stacker;
