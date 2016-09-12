var visualizer = (function () {

var margin = { top: 8, right: 40, bottom: 8, left: 40 },
    width  = 1200 - margin.right - margin.left,
    height = 760 - margin.top - margin.bottom;


var x = d3.scaleLinear().range([0, width]);

var y = d3.scaleLinear().range([0, height]);

var color = d3.scaleOrdinal(d3.schemeCategory10);

var xAxis = d3.axisBottom()
    .scale(x);

var yAxis = d3.axisLeft()
    .scale(y);

var svg = d3.select('body').append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
  .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

function render (matrix) {
    var state = matrix || state,
        data  = [];
    for (i = 0; i < size; i++) {
        for (t = 0; t < steps; t++) {
            data[data.length] = {
                state: state[i][t],
                x    : t,
                y    : i
            }
        }
    };

    x.domain(d3.extent(data, function(d) { return d.x; }));
    y.domain(d3.extent(data, function(d) { return d.y; }));

    svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis)
      .append('text')
        .attr('class', 'label')
        .attr('x', width + 100)
        .attr('y', -6)
        // .attr('transform', 'translate(0,' + 50 + ')')
        .style('text-anchor', 'end')
        .text('time');

    svg.append('g')
        .attr('class', 'y axis')
        .call(yAxis)
      .append('text')
        .attr('class', 'label')
        .attr('transform', 'rotate(-90)')
        .attr('y', 6)
        // .attr('dy', '.71em')
        // .attr('transform', 'translate(' + -50 + ',0)')
        .style('text-anchor', 'end')
        .text('entities')

    svg.selectAll('.dot')
        .data(data)
      .enter().append('circle')
        .attr('class', 'dot')
        .attr('r', 2.5)
        .attr('cx', function(d) { return x(d.x); })
        .attr('cy', function(d) { return y(d.y); })
        .style('fill', function(d) { return color(d.state); });

    var legend = svg.selectAll('.legend')
        .data(color.domain())
    .enter().append('g')
          .attr('class', 'legend')
          .attr('transform', function(d, i) { return 'translate(0,' + i * 20 + ')'; });

  // draw legend colored rectangles
  legend.append('rect')
          .attr('x', width - 18)
          .attr('width', 18)
          .attr('height', 18)
          .style('fill', color);

  // draw legend text
  legend.append('text')
          .attr('x', width - 24)
          .attr('y', 9)
          .attr('dy', '.35em')
          .style('text-anchor', 'end')
          .text(function(d) { return d;})
};

return {
    render: render
};

})();