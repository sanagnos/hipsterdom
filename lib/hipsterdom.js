// ============================================================================
// hipsterdom.js
// ============================================================================
//
// A test.
//
// Copyright (c) 2014, Stelios Anagnostopoulos <stelios@outlook.com>
// All rights reserved.
// ============================================================================

'use strict';

var hipsterdom = (function () {

// ============================================================================
// Config
// ============================================================================

var beta      = 0.3,
    size      = 400,
    steps     = 500,
    ratio     = 0.5,
    wmin      = 0.2,
    wincr     = 0.1,
    wdecr     = 0.05,
    log       = false,
    localize  = false,
    learning  = false;

// ============================================================================
// Declare
// ============================================================================

var floor  = Math.floor,
    random = Math.random,
    abs    = Math.abs,
    sqrt   = Math.sqrt,
    tanh   = Math.tanh;

var negCount = 0,
    posCount = 0,
    pnRatio  = 0,
    hsize    = floor(size * ratio);

var type   = new Uint8Array(size),
    state  = createMatrix(size, steps),
    delay  = createMatrix(size, size),
    weight = learning
        ? createMatrix(size, size, wmin)
        : createMatrix(size, size, function (row, col) {
            return random();
        });


// ============================================================================
// Init
// ============================================================================

var t, i, j, k, r, c, len, prob, sum, vmap, value, prev;

// init delay matrix with poisson
for (i = 0; i < size; i++) {
    delay[i] = mctad.poisson(abs(sqrt(size))).generate(size);
    if (localize)
        for (j = 0; j < size; j++)
            delay[i][j] = delay[i][j] * abs(i - j) + 1;
}

// initialize response tendencies
for (i = hsize; i < type.length; i++)
    type[i] = -1;     // conventional
while (hsize--)
    type[hsize] = 1;  // hipster
type = shuffle(type); // mingle


function propagate (input, iterations) {

    if (iterations) {
        var iterCount = iterations;
        while (iterCount--)
            propagate(input.map(function (val) { return val * (1 + Math.random()); }));
        if (log) console.log('positives:\t' + posCount + '\nnegatives:\t' + negCount + '\npos-neg ratio:\t' + pnRatio);
        return state;
    }

    negCount = 0;
    posCount = 0;

    // initialize state at t0
    if (!input) {
        i = size;
        while (i--) {
            if (random() > 0.5) {
                state[i][0] = 1;
                posCount++;
            } else {
                state[i][0] = -1;
                negCount++;
            }
        }
    } else {
        i = input.length;
        while (i--) {
            if (input[i] > 0) {
                state[i][0] = 1;
                posCount++;
            } else if (input[i] < 0) {
                state[i][0] = -1;
                negCount++;
            } else {
                state[i][0] = 0;
            }
        }
    }

    // propagate in time
    for (t = 1; t < steps; t++) {

        if (log) console.log('step: ' + t);

        for (i = 0; i < size; i++) {
            sum  = 0;
            vmap = {};
            for (j = 0; j < size; j++) {
                k = t - delay[i][j];
                sum += weight[i][j] * (k > 0 ? state[j][k] : state[j][0]);
                if (learning) {
                    if (weight[i][j] + wincr >= 1.0)
                        weight[i][j] += wincr
                    else
                        weight[i][j] = 1.0;
                }
                vmap[j] = 1;
            }
            if (learning) {
              len = size;
              while (len--)
                if (!vmap[len]) {
                  if (weight[i][len] -= wdecr <= 0)
                      weight[i][len] -= wdecr;
                  else
                      weight[i][len] = 0;
              }
            }

            value = sum / size;      // impression
            prev  = state[i][t - 1]; // state at t-1

            if (beta) {
                prob = ( 1 + tanh( beta * (-type[i] * value * prev) ) ) / 2;
                state[i][t] = ( prob > random() ? 1 : -1 ) * prev;
            } else {
                if (type[i] === 1)
                    state[i][t] = prev * value > 0 ? -prev : prev;
                else
                    state[i][t] = prev * value > 0 ? prev : -prev;
            }

            if (state[i][t] > 0)
                posCount++;
            else
                negCount++;
        }
    }

    pnRatio = posCount / negCount;

    if (log) console.log('positives:\t' + posCount + '\nnegatives:\t' + negCount + '\npos-neg ratio:\t' + pnRatio);
    return state;
};

// ============================================================================
// Util
// ============================================================================

function createMatrix (rows, cols, val) {
    var arr    = new Array(rows),
        init   = arguments.length === 3,
        r, c;
    for (r = 0; r < rows; r++) {
        arr[r] = new Float32Array(cols);
        if (init)
            for (c = 0; c < cols; c++)
                arr[r][c] = typeof val === 'function' ? val(r, c) : val;
    }
    return arr;
};

function shuffle (array) {
    var cidx = array.length,
        ridx,
        tmp;
    while (0 !== cidx) {
        ridx = floor(random() * cidx);
        cidx -= 1;
        tmp = array[cidx];
        array[cidx] = array[ridx];
        array[ridx] = tmp;
    }

    return array;
};

return {
    propagate: propagate
};

})();
