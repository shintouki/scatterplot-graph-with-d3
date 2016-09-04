let jsonUrl = "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/cyclist-data.json";

let convertToMins = function(d) {
  let mins = Math.floor(d / 60);
  let secs = d % 60;
  if (secs === 0) {
    secs += "0";
  }
  return mins + ":" + secs;
};

let margin = {
  top: 30,
  right: 60,
  bottom: 50,
  left: 60
};
let width = 960 - margin.left - margin.right;
let height = 500 - margin.top - margin.bottom;

// x axis scale
let x = d3.scale.linear()
  .range([0, width]);

// y axis scale
let y = d3.scale.linear()
  .range([height, 0]);

let xAxis = d3.svg.axis()
  .scale(x)
  .orient("bottom")
  .ticks(10)
  .tickFormat(convertToMins);

let yAxis = d3.svg.axis()
  .scale(y)
  .orient("left");

let chart = d3.select(".chart")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Get json data
d3.json(jsonUrl, function(error, json) {

  let data = json;
  let firstRankSeconds = data[0].Seconds;
  let lastRankSeconds = data[data.length - 1].Seconds;

  x.domain([lastRankSeconds + 10, firstRankSeconds]);
  y.domain([d3.max(data, function(d) {
    return d.Place;
  }), 1]);

  // Div for tooltip box
  let tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("opacity", 0);

  // x axis
  chart.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)
    .append("text")
    .attr("x", width / 2)
    .attr("y", 45)
    .style("text-anchor", "end")
    .text("Minutes Taken to Finish");

  // y axis
  chart.append("g")
    .attr("class", "y axis")
    .call(yAxis)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", (-1 * height / 2))
    .attr("y", -45)
    .style("text-anchor", "end")
    .text("Rank");

  // Calculate minutes behind fastest time
  function minsBehindFastest(firstRank, currRank) {
    let firstRankMins = parseInt(firstRank.substring(0, 2));
    let firstRankSecs = parseInt(firstRank.substring(3, 5));
    let currRankMins = parseInt(currRank.substring(0, 2));
    let currRankSecs = parseInt(currRank.substring(3, 5));

    let minDiff = currRankMins - firstRankMins;
    let secDiff = currRankSecs - firstRankSecs;

    if (secDiff < 0) {
      minDiff--;
      secDiff += 60;
    }
    let timeBehind = minDiff + ":" + secDiff;

    return timeBehind;
  }

  // Draw circle for each data point
  chart.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", function(d) {
      return x(d.Seconds);
    })
    .attr("cy", function(d) {
      return y(d.Place);
    })
    .attr("r", 5)
    .style("fill", function(d) {
      if (d.Doping === "") {
        return "black";
      }
      return "red";
    })
    .on("mouseover", function(d) {
      // Tooltip
      let name = d.Name;
      let time = d.Time;
      let year = d.Year;
      let nationality = d.Nationality;
      let doping = d.Doping;
      if (doping === "") {
        doping = "No doping allegations";
      }
      let timeBehind = minsBehindFastest(data[0].Time, time);

      tooltip.transition()
        .duration(200)
        .style("opacity", 0.9);
      tooltip.html("Name: " + name + "<br/>" + "Nationality: " + nationality + "<br/>" +
          "Year: " + year + "<br/>" + "Time: " + time + "<br/>" +
          "Time Behind Top Rank Finisher: " + timeBehind + "<br/>" + "<br/>" +
          doping)
        .style("left", (d3.event.pageX + 10) + "px")
        .style("top", (d3.event.pageY - 142) + "px");
      // Circle highlight border
      d3.select(this)
        .style("stroke", "yellow")
        .style("stroke-width", 2);;
    })
    .on("mouseout", function(d) {
      tooltip.transition()
        .duration(500)
        .style("opacity", 0);
      // Remove circle highlight color
      d3.select(this)
        .style("stroke", "");
    });

  // Draw legend
  let legend = d3.select(".chart").append("g")
    .attr("class", "legend")
    .attr("transform", "translate(" + (width - 150) + ", " + (height - 150) + ")");

  legend.append("rect")
    .attr("y", 0)
    .attr("width", 18)
    .attr("height", 18)
    .style("fill", "black");

  legend.append("text")
    .attr("x", 25)
    .attr("y", 13)
    .attr("width", 18)
    .attr("height", 18)
    .text("No doping allegations");

  legend.append("rect")
    .attr("y", 25)
    .attr("width", 18)
    .attr("height", 18)
    .style("z-index", "10")
    .style("fill", "red");

  legend.append("text")
    .attr("x", 25)
    .attr("y", 40)
    .attr("width", 18)
    .attr("height", 18)
    .style("z-index", "10")
    .style("fill", "black")
    .text("Has doping allegations");
});

// Title
d3.select(".title")
  .append("text")
  .style("text-anchor", "end")
  .text("Doping In Professional Bike Racing");