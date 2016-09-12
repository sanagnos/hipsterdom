'use strict'

var size   = 400
var steps  = 500
var matrix = hipsterdom.propagate()

var v = ''
for (var i = 0; i < matrix.length; i++)
    v += matrix[i][0] > 0 ? 1 : 0

var v    = ''
var imax = matrix[0].length - 1
for (var i = 0; i < matrix.length; i++)
    v += matrix[i][imax] > 0 ? 1 : 0

visualizer.render(matrix);
