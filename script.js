console.log("Starting...");
d3.json("/data/ISIS.json")
	.then((data, error) => {
		freqChart("#vis1", "Country", data, 0, sortByCount);
		freqChart("#vis2", "RequestedTime", data, 0, sortByName);
		freqChart("#vis3", "AllocatedTime", data, 0, sortByName);
		freqChart("#vis4", "InstrumentRequested", data, 0, sortByCount);
	});

function freqChart(containerId, field, data, minOccurThresh, sortFunc) {
	let prefilterCounts = countOccurrences(data, field);
	let counts = prefilterCounts.filter(e => e.count >=minOccurThresh);
	counts.sort(sortFunc);
	// set the dimensions and margins of the graph
	var margin = {top: 30, right: 30, bottom: 70, left: 60};
	let width = 960 - margin.left - margin.right;
	let height = 720 - margin.top - margin.bottom;

	// append the svg object to the body of the page
	var svg = d3.select(containerId)
		.append("svg")
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


	// X axis
	var x = d3.scaleBand()
		.domain(counts.map(function(d) { return d.name; }))
		.range([0, width])
		.padding(0.2);

	svg.append("g")
		.attr("transform", "translate(0," + height + ")")
		.call(d3.axisBottom(x))
		.selectAll("text")
		.attr("transform", "translate(-10,0)rotate(-45)")
		.style("text-anchor", "end");

	// Add Y axis
	var y = d3.scaleLinear()
		.domain([0, d3.max(counts, d => d.count)])
		.range([height, 0]);

	svg.append("g")
		.call(d3.axisLeft(y));

	// Bars
	svg.selectAll("mybar")
		.data(counts)
		.enter()
		.append("rect")
		.attr("x", function(d) { return x(d.name); })
		.attr("y", function(d) { return y(d.count); })
		.attr("width", x.bandwidth())
		.attr("height", function(d) { return height - y(d.count); })
		.attr("fill", "#69b3a2")

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
