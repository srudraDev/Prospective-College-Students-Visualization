var collegeData = [];
// Scatter Plot values
const scatterPlotWidth = 600;
const scatterPlotHeight = 600;
var raceData = [];
// PIE values
const width = 200;
const height = 200;
const padding = 10;
const radius = Math.min (width - padding, height - padding) / 2;
const arc = d3.arc()
    .innerRadius(0)
    .outerRadius(radius);
// an array of 10 categorical colors
const color = d3.scaleOrdinal(d3.schemeAccent);

// Bar chart values
const margin = {t: 10, r: 20, b: 60, l: 70};
const barChartWidth = 500 - margin.r - margin.l;
const barChartHeight = 500 - margin.t - margin.b;
const medianTitles = ["Median Debt", "Median Debt on Graduation", "Median Debt on Withdrawal"];

function createDemographicDict(college) {
    raceData = [
        {race: "White", value: college.White},
        {race: "Black", value: college.Black},
        {race: "Hispanic", value: college.Hispanic},
        {race: "Asian", value: college.Asian},
        {race: "American Indian", value: college.AmericanIndian},
        {race: "Pacific Islander", value: college.PacificIslander},
        {race: "Biracial", value: college.Biracial},
        {race: "Other", value: college.Other},
    ];
    return raceData;
}

d3.csv("/dataset/colleges.csv", data => {
    // Reformatting and initializing data
    collegeData = data.map(d => {
        d.White = (+d["% White"] * 100).toFixed(2);
        d.Black = (+d["% Black"] * 100).toFixed(2);
        d.Hispanic = (+d["% Hispanic"] * 100).toFixed(2);
        d.Asian = (+d["% Asian"] * 100).toFixed(2);
        d.AmericanIndian = (+d["% American Indian"] * 100).toFixed(2);
        d.PacificIslander = (+d["% Pacific Islander"] * 100).toFixed(2);
        d.Biracial = (+d["% Biracial"] * 100).toFixed(2);
        d.Other = +(100 - d3.sum([d.White, d.Black, d.Hispanic, d.Asian, d.AmericanIndian, d.PacificIslander, d.Biracial])).toFixed(2);
        return d;
    });
    // First College to display without user input
    const college = collegeData[0];
    raceData = createDemographicDict(college);
    // Static text
    document.getElementById("ACT").innerHTML = college["ACT Median"];
    document.getElementById("SAT").innerHTML = college["SAT Average"];

    // Scatter plot
    const arExtent = d3.extent(data, function(row) { return row["Admission Rate"];});
    const rrExtent = d3.extent(data, function(row) { return row["Retention Rate (First Time Students)"];});
    const xScale = d3.scaleLinear().domain(rrExtent).range([50,570]);
    const yScale = d3.scaleLinear().domain(arExtent).range([570,30]);

    const xAxis = d3.axisBottom().scale(xScale);
    const yAxis = d3.axisLeft().scale(yScale);

    // Tooltip for selected college
    var tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("background-color", "white")
    .style("border", "1px solid #ccc")
    .style("border-radius", "5px")
    .style("padding", "10px")
    .style("box-shadow", "0px 0px 5px rgba(0,0,0,0.3)")
    .style("opacity", 0);

    var scatterPlot = d3.select("#scatterPlot")
        .append("svg:svg")
        .attr("width", scatterPlotWidth)
        .attr("height", scatterPlotHeight);

    var temp = scatterPlot.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("id",function(d,i) {return i;} )
        .attr('fill', 'steelblue')
        .attr("stroke", "blue")
        .classed('selected', function(m) {
            return m.Name === college.Name;
        })
        .attr("cx", function(d) { return xScale(d["Retention Rate (First Time Students)"]); })
        .attr("cy", function(d) { return yScale(d["Admission Rate"]); })
        .attr("r", 4)
        // tooltip details
        .on("mouseover", function (d, event) {
            const cx = xScale(d["Retention Rate (First Time Students)"]);
            const cy = yScale(d["Admission Rate"]);
            if (d3.select(this).classed('selected')) {
                tooltip
                    .html(`
                        <strong>Admission Rate:</strong> ${+(d["Admission Rate"] * 100).toFixed(2)}%<br>
                        <strong>Retention Rate:</strong> ${+(d["Retention Rate (First Time Students)"] * 100).toFixed(2)}%<br>
                        <strong>College Area:</strong> ${d.Locale}<br>
                        <strong>Type of Institution:</strong> ${d.Control}</br>
                        <strong>Average Cost:</strong> $${d["Average Cost"]}
                    `)
                    .style("left", `${cx}px`)
                    .style("top", `${cy}px`)
                    .transition()
                    .duration(200)
                    .style("opacity", 1);
            }
        })
        .on("mouseout", function () {
            tooltip
                .transition()
                .duration(200)
                .style("opacity", 0);
        });
    // X-Axis Label
    scatterPlot.append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(0,"+ (scatterPlotWidth - 30)+ ")")
        .call(xAxis)
        .append("text")
        .attr("x", scatterPlotWidth - 250)
        .attr("y", 25)
        .style("text-anchor", "end")
        .style("fill", "black")
        .text("Retention Rate");
    // Y-Axis Label
    scatterPlot.append("g")
        .attr("class", "y-axis")
        .attr("transform", "translate(50, 0)")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -265)
        .attr("y", -45)
        .attr("dy", ".71em")
        .style("fill", "black")
        .text("Admission Rate");
    
    // stream all college names into dropdown
    populateDropdown(collegeData);


    // PIE chart

    const opacity = 0.8;
    const opacityHover = 1;
    const otherHover = 0.8;
    const tooltipMargin = 13;
    var svg = d3.select("#pieChart")
        .append('svg')
        .attr('class', 'pie')
        .attr('id', "svgPie")
        .attr('width', width)
        .attr('height', 300);

    var g = svg.append('g')
        .attr('transform', 'translate(' + (width / 2) + ',' + (height / 2) + ')');
    const pie = d3.pie()
        .value(function (d) {
            return d.value;
        })
        .sort(null);

    const path = g.selectAll('path')
        .data(pie(raceData))
        .enter()
        .append("g")
        .append('path')
        .attr('d', arc)
        .attr('fill', (d, i) => color(i))
        .style('opacity', opacity)
        .style('stroke', 'white')
        .on("mouseover", function (d) {
            d3.selectAll('path')
                .style("opacity", otherHover);
            d3.select(this)
                .style("opacity", opacityHover);

            // tooltip feature: hover
            var g = d3.select("#svgPie")
                .style("cursor", "pointer")
                .append("g")
                .attr("class", "tooltip")
                .style("opacity", 0);

            g.append("text")
                .attr("class", "name-text")
                // display value as percent
                .text(`${d.data.race} (${d.data.value + "%"})`)
                .attr('text-anchor', 'middle');

            var text = g.select("text");
            var bbox = text.node().getBBox();
            var padding = 2;
            g.insert("rect", "text")
                .attr("x", bbox.x - padding)
                .attr("y", bbox.y - padding)
                .attr("width", bbox.width + (padding * 2))
                .attr("height", bbox.height + (padding * 2))
                .style("fill", "white")
                .style("opacity", 0.9);
        })
        .on("mousemove", function (d) {
            var mousePosition = d3.mouse(this);
            var x = mousePosition[0] + width / 2;
            var y = mousePosition[1] + height / 2 - tooltipMargin;
            var text = d3.select('.tooltip text');
            var bbox = text.node().getBBox();
            // bound checks
            if (x - bbox.width / 2 < 0) {
                x = bbox.width / 2;
            }
            else if (width - x - bbox.width / 2 < 0) {
                x = width - bbox.width / 2;
            }

            if (y - bbox.height / 2 < 0) {
                y = bbox.height + tooltipMargin * 2;
            }
            else if (height - y - bbox.height / 2 < 0) {
                y = height - bbox.height / 2;
            }

            d3.select('.tooltip')
                .style("opacity", 1)
                .attr('transform', `translate(${x}, ${y})`);
        })
        .on("mouseout", function (d) {
            d3.select("#svgPie")
                .style("cursor", "none")
                .select(".tooltip").remove();
            d3.selectAll('path')
                .style("opacity", opacity);
        })
        .on("touchstart", function (d) {
            d3.select("#svgPie")
                .style("cursor", "none");
        })
        .each(function (d, i) {
            this._current = i;
        });
    // Legend for PIE chart
    var legend = d3.select("#pieChart").append('div')
        .attr('class', 'legend')
        .style('margin-top', '30px');
    // Keys for dissecting each color
    var keys = legend.selectAll('.key')
        .data(raceData)
        .enter().append('div')
        .attr('class', 'key')
        .style('display', 'flex')
        .style('align-items', 'center')
        .style('margin-right', '20px');

    keys.append('div')
        .attr('class', 'symbol')
        .style('height', '10px')
        .style('width', '10px')
        .style('margin', '5px 5px')
        .style('background-color', (d, i) => color(i));

    keys.append('div')
        .attr('class', 'name')
        .text(d => `${d.race}`);

    keys.exit().remove();

    //add title of PIE chart
    svg.append("text")
        .attr("x", (width / 2))
        .attr("y", 215)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Demographics of College");

    // BAR chart

    // set ranges
    var x = d3.scaleBand()
        .range([0, barChartWidth]);

    var y = d3.scaleLinear()
        .range([barChartHeight, 0]);

    var barChart = d3.select("#barChart")
        .append('svg')
        .attr("id", "barChart")
        .attr('width', barChartWidth + margin.l + margin.r)
        .attr('height', barChartHeight + margin.t + margin.b)
        // append a 'group' element to 'svg'
        .append('g')
        // moves the 'group' element to the top left margin
        .attr("transform", "translate(" + margin.l + ',' + margin.r + ')');
    
    // determines x axis scale and max scale of y-axis
    var count = [Number(college[medianTitles[0]]), Number(college[medianTitles[1]]), Number(college[medianTitles[2]])];

    // Scale range of the data in the domains
    x.domain(medianTitles);
    y.domain([0, d3.max(count) + 4000]);

    var barXScale = d3.scaleBand()
        .domain(d3.range(count.length))
        .rangeRound([0, barChartWidth])
        .paddingInner(0.05);

    var barYScale = d3.scaleLinear()
        .domain([0, d3.max(count) + 4000])
        .range([0, barChartHeight]);

    barChart.selectAll("rect")
        .data(count)
        .enter()
        .append("rect")
        .attr("x", function (d, i) {
            return barXScale(i);
        })
        .attr("y", function (d) {
            return barChartHeight - barYScale(d);
        })
        .attr("width", barXScale.bandwidth())
        .attr("height", function (d) {
            return barYScale(d);
        })
        .attr("fill", function (d) {
            // red
            return "rgb(225, 55, 0)";
        });

    // X-Axis
    barChart.append("g")
        .attr("transform", "translate(0," + barChartHeight + ")")
        .call(d3.axisBottom(x));

    // label for Y-Axis
    barChart.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.l)
        .attr("x", 0 - (barChartHeight / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Dollars");

    // Y-Axis
    barChart.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(y));

    //Title of Bar Chart
    barChart.append("text")
        .attr("x", (barChartWidth / 2))
        .attr("y", 2 - margin.t)
        .attr("text-anchor", "middle")
        .style("font-size", "15px")
        .style("text-decoration", "underline")
        .text("Median Debt of a Student");
})

function populateDropdown(data) {
    const selector = document.getElementById('selectCollege');
    data.forEach(d => {
        selector.options.add(new Option(d.Name, d.Name));
    });
}
// On-change function when dropdown selection occurs
function generateGraphs() {
    // reset input feature
    document.getElementById("cutoff").value = "0";
    filterScatterPlot();

    // find selected college
    var e = document.getElementById("selectCollege");
    var selectedCollegeName = e.options[e.selectedIndex].text;
    const college = collegeData.find(d => d.Name === selectedCollegeName);
    if (!college) return;

    //Update static data
    document.getElementById("ACT").innerHTML = college["ACT Median"];
    document.getElementById("SAT").innerHTML = college["SAT Average"];
    // Update scatter plot selection
    d3.selectAll("circle").classed('selected', d => d.Name === selectedCollegeName)
        .each(function(d) {
            if (d.Name === selectedCollegeName) {
                this.parentNode.appendChild(this); // Move selected circle to the top
            }
        });
    updatePieChart(college);
    updateBarChart(college);
}
// called inside generateGraphs() to update PIE chart with new data
function updatePieChart(college) {
    createDemographicDict(college);
     // Select the existing SVG element for the pie chart
     var svg = d3.select("#svgPie");
     var g = svg.select("g");
 
     // Bind new data to the paths
     const pie = d3.pie().value(d => d.value).sort(null);
     // Update the pie chart paths
     var paths = g.selectAll("path")
         .data(pie(raceData));

    paths.enter()
         .append("path")
         .attr("d", arc)
         .attr("fill", (d, i) => color(i))
         .style("opacity", 0.8)
         .style("stroke", "white")
         .each(function(d) { this._current = d; }); // store the initial angles for transition

    paths.transition()
         .duration(750)
         .attrTween("d", function(d) {
             var interpolate = d3.interpolate(this._current, d);
             this._current = interpolate(0);
             return function(t) {
                 return arc(interpolate(t));
             };
         });
 
     // Remove old slices
     paths.exit().remove();
}
// called inside generateGraphs() to update BAR chart with new data
function updateBarChart(college) {
    // determines x axis scale and max scale of y-axis
    var count = [Number(college[medianTitles[0]]), Number(college[medianTitles[1]]), Number(college[medianTitles[2]])];
    var x = d3.scaleBand()
        .range([0, barChartWidth]);

    var y = d3.scaleLinear()
        .range([barChartHeight, 0]);
    y.domain([0, d3.max(count) + 4000]);
    x.domain(medianTitles);
    var barYScale = d3.scaleLinear()
        .domain([0, d3.max(count) + 4000])
        .range([0, barChartHeight]);
    
    // Update bars with new data
    var bars = d3.select("#barChart").selectAll("rect")
        .data(count);

    // Transform existing bars
    bars.transition() // Smooth transition for existing bars
        .duration(750)
        .attr("y", function(d) { return barChartHeight - barYScale(d); })
        .attr("height", function(d) { return barYScale(d); });

    // Update Y-Axis as max Y-scale may be higher or lower
    d3.select("#barChart").select(".y-axis")
        .transition()
        .duration(750)
        .call(d3.axisLeft(y));
}
// onInput function that filter Retention Rates
function filterScatterPlot() {
    const minVal = parseFloat(document.getElementById("cutoff").value);
    if (isNaN(minVal) || minVal < 0 || minVal > 1) {
        return; // Do nothing for invalid inputs
    }
    // Make sure selected College dissappears when its retention rate is outside minimum
    var e = document.getElementById("selectCollege");
    var selectedCollegeName = e.options[e.selectedIndex].text;

    // Filter the data based on the retention rate cutoff
    const filteredData = collegeData.filter(d => d["Retention Rate (First Time Students)"] >= minVal);
    // Update scatter plot with filtered data
    const xScale = d3.scaleLinear().domain(d3.extent(filteredData, d => d["Retention Rate (First Time Students)"])).range([50, 570]);
    const yScale = d3.scaleLinear().domain(d3.extent(filteredData, d => d["Admission Rate"])).range([570, 30]);
    const xAxis = d3.axisBottom().scale(xScale);
    // Update circles in the scatter plot
    var scatterPlot = d3.select("#scatterPlot svg");
    var circles = scatterPlot.selectAll("circle").data(filteredData);
    var tooltip = d3.select(".tooltip");
    // Update X-Axis
    scatterPlot.select("g.x-axis").transition().duration(500).call(xAxis);

    // Exit: Remove circles for data points no longer in the dataset
    circles.exit().remove();
    // Enter: Add new circles for filtered data points
    circles.enter()
        .append("circle")
        .merge(circles)
        .attr("cx", d => xScale(d["Retention Rate (First Time Students)"]))
        .attr("cy", d => yScale(d["Admission Rate"]))
        .attr("r", 4)
        .attr("fill", "steelblue")
        .attr("stroke", "blue")
        .classed('selected', d => d.Name === selectedCollegeName)
        .each(function(d) {
            if (d.Name === selectedCollegeName) {
                this.parentNode.appendChild(this); // Move selected circle to the top
            }
        });
    circles.on("mouseover", function (d, event) {
        const cx = xScale(d["Retention Rate (First Time Students)"]);
        const cy = yScale(d["Admission Rate"]);
        if (d3.select(this).classed('selected')) {
            tooltip
                .html(`
                    <strong>Admission Rate:</strong> ${(d["Admission Rate"] * 100).toFixed(2)}%<br>
                    <strong>Retention Rate:</strong> ${(d["Retention Rate (First Time Students)"] * 100).toFixed(2)}%<br>
                    <strong>College Area:</strong> ${d.Locale}<br>
                    <strong>Type of Institution:</strong> ${d.Control}</br>
                    <strong>Average Cost:</strong> $${d["Average Cost"]}
                `)
                .style("left", `${cx}px`)
                .style("top", `${cy}px`)
                .transition()
                .duration(200)
                .style("opacity", 1);
        }
    })
    .on("mouseout", function () {
        tooltip.transition().duration(200).style("opacity", 0);
    });
}