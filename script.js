console.log("Starting...");

logScales = false;
let countriesChart = (data, thresh) => freqChart("#vis1", "Country", data, thresh, sortByCount);
let requestedTimesChart = (data, thresh) => freqChart("#vis2", "RequestedTime", data, thresh, sortByName);
let allocatedTimesChart = (data, thresh) => freqChart("#vis3", "AllocatedTime", data, thresh, sortByName);
let requestedInstrumentsChart = (data, thresh) => freqChart("#vis4", "InstrumentRequested", data, thresh, sortByCount);

function drawAll(data) {
	countriesChart(data, 0);
	requestedTimesChart(data, 0);
	allocatedTimesChart(data, 0);
	requestedInstrumentsChart(data, 0);
}

d3.json("/data/ISIS.json")
	.then((data, error) => {
		drawAll(data);
		document.getElementById("vis1-thresh-input").addEventListener("input", 
			evt => countriesChart(data, evt.srcElement.value));
		document.getElementById("vis2-thresh-input").addEventListener("input", 
			evt => requestedTimesChart(data, evt.srcElement.value));
		document.getElementById("vis3-thresh-input").addEventListener("input", 
			evt => allocatedTimesChart(data, evt.srcElement.value));
		document.getElementById("vis4-thresh-input").addEventListener("input", 
			evt => requestedInstrumentsChart(data, evt.srcElement.value));
		document.getElementById("log-scales-btn").addEventListener("click", e => {
			logScales = logScales === true ? false : true;
			drawAll(data);
		});
	});

function freqChart(containerId, field, data, minOccurThresh, sortFunc) {
	let prefilterCounts = countOccurrences(data, field);
	let counts = prefilterCounts.filter(e => e.count >=minOccurThresh);
	counts.sort(sortFunc);
	// set the dimensions and margins of the graph
	var margin = {top: 30, right: 30, bottom: 90, left: 60};
	let width = 960 - margin.left - margin.right;
	let height = 720 - margin.top - margin.bottom;
	// X axis
	var x = d3.scaleBand()
		.domain(counts.map(function(d) { return d.name; }))
		.range([0, width])
		.padding(0.2);

	var y;
	// Add Y axis
	if(logScales) {
		y = d3.scaleLog()
			.domain([1, d3.max(counts, d => d.count)])
			.range([height, 0]);
	} else {
		y = d3.scaleLinear()
			.domain([0, d3.max(counts, d => d.count)])
			.range([height, 0]);
	}

	let svg = buildAxes(containerId, margin, width, height, x, y, counts, field);

	// Bars
	let bars = svg.selectAll(".bar")
		.data(counts, d => d.name);

	bars.enter()
		.append("rect")
		.attr("class", "bar")
		.attr("x", function(d) { return x(d.name); })
		.attr("y", function(d) { return y(d.count); })
		.attr("width", x.bandwidth())
		.attr("height", function(d) { return height - y(d.count); })
		.attr("fill", "#69b3a2")
}

function buildAxes(containerId, margin, width, height, x, y, data, field) {

	// append the svg object to the body of the page
	var svg = d3.select(containerId);
	svg.select("svg").remove();
	svg = svg.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform",
			"translate(" + margin.left + "," + margin.top + ")");

	// Add title
	svg.append("text")
		.attr("x", (width / 2))
		.attr("text-anchor", "middle")
		.style("font-size", "24px")
		.text("Number of proposals by '" + field + "'");

	svg.append("g")
		.attr("transform", "translate(0," + height + ")")
		.call(d3.axisBottom(x))
		.selectAll("text")
		.attr("transform", "translate(-10,0)rotate(-45)")
		.style("text-anchor", "end");

	svg.append("g")
		.call(d3.axisLeft(y));
	return svg;
}


function countOccurrences(data, member) {
	countDict = {}
	data.forEach(d => {
		let val = d[member] == null ? "unknown" 
			: typeof(d[member]) === "string" ? d[member].toUpperCase() : d[member];
		if (countDict[val] === undefined) {
			countDict[val] = 1;
		} else {
			countDict[val] += 1;
		}
	});

	counts = [];
	for (const [country, freq] of Object.entries(countDict)) {
		counts.push({"name": country, "count": freq});
	}
	return counts;
}

function sortByCount(e1, e2) {
	return e2["count"] - e1["count"];
}

function sortByName(e1, e2) {
	return e2["name"] > e1["name"];
}
