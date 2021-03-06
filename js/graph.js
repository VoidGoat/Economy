var n =1, // number of layers
    m = 30, // number of samples per layer
    grouped = true,
    stack = d3.layout.stack();

var array = [];

var margin = {top: 40, right: 10, bottom: 20, left: 10},
  width = 960 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

var x = d3.scale.ordinal()
  .domain(d3.range(m))
  .rangeRoundBands([0, width], 0.08);

var xAxis = d3.svg.axis()
  .scale(x)
  .tickSize(0)
  .tickPadding(6)
  .tickFormat(function(d) { return d + 1 + ""; } )
  .orient("bottom");

var svg = d3.select("body").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .style("background-color", "rgb(222, 222, 222)")
  .text("hello")
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

svg.append("g")
  .attr("class", "x axis")
  .attr("transform", "translate(0," + height + ")")
  .call(xAxis);


$.ajax({
  url: "https://www.reddit.com/r/games/top.json?limit=" + m,
  type: 'GET',
  async: true,
  success: function(result){
  for ( i = 0; i < m; i++) array.push({"x": i, "y": result.data.children[i].data.score});
  var layers = stack(d3.range(n).map(function() { return array; })),
  yGroupMax = d3.max(layers, function(layer) { return d3.max(layer, function(d) { return d.y; }); }),
  yStackMax = d3.max(layers, function(layer) { return d3.max(layer, function(d) { return d.y0 + d.y; }); });

  var y = d3.scale.linear()
    .domain([0, yStackMax])
    .range([height, 0]);

  var color = getRandomColor();

  var layer = svg.selectAll(".layer")
    .data(layers)
    .enter().append("g")
      .style("fill", '#39be5e')
      .attr("class", "layer");

console.log(layers);
  var rect = layer.selectAll("rect")
    .data(function(d) { return d; })
    .enter().append("rect")
      .attr("x", function(d) { return x(d.x); })
      .attr("y", height)
      .attr("width", x.rangeBand())
      .attr("height", 0)
      // .style("fill", function(d) { return ColorLuminance("#55e87e",0.35 * ( (d.y / layers[0][0].y) - 1 ));})
      .attr("class", "rect");

  rect.transition()
    .delay(function(d, i) { return i * 10; })
    .attr("y", function(d) { return y(d.y0 + d.y); })
    .attr("height", function(d) { return y(d.y0) - y(d.y0 + d.y); });



}
});


function transitionGrouped() {
  y.domain([0, yGroupMax]);

  rect.transition()
      .duration(500)
      .delay(function(d, i) { return i * 10; })
      .attr("x", function(d, i, j) { return x(d.x) + x.rangeBand() / n * j; })
      .attr("width", x.rangeBand() / n)
    .transition()
      .attr("y", function(d) { return y(d.y); })
      .attr("height", function(d) { return height - y(d.y); });
}

function transitionStacked() {
  y.domain([0, yStackMax]);

  rect.transition()
      .duration(500)
      .delay(function(d, i) { return i * 10; })
      .attr("y", function(d) { return y(d.y0 + d.y); })
      .attr("height", function(d) { return y(d.y0) - y(d.y0 + d.y); })
    .transition()
      .attr("x", function(d) { return x(d.x); })
      .attr("width", x.rangeBand());
}
