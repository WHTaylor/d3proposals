console.log("Starting...");
d3.json("/data/ISIS.json")
	.then((data, error) => freq_chart(".vis", "Country", data, 0));

function freq_chart(containerId, field, data, minOccurThresh) {
	let prefilterCounts = count_occurences(data, field);
	let counts = prefilterCounts.filter(e => e.count >=minOccurThresh);
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

	// X axis
	var x = d3.scaleBand()
		.range([0, width])
		.domain(counts.map(function(d) { return d.country; }))
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
		.attr("x", function(d) { return x(d.country); })
		.attr("y", function(d) { return y(d.count); })
		.attr("width", x.bandwidth())
		.attr("height", function(d) { return height - y(d.count); })
		.attr("fill", "#69b3a2")
}

function count_occurences(data, member) {
	count_dict = {}
	data.forEach(d => {
		let val = d[member] == null ? "unknown" 
			: typeof(d[member]) === "string" ? d[member].toUpperCase() : d[member];
		if (count_dict[val] === undefined) {
			count_dict[val] = 1;
		} else {
			count_dict[val] += 1;
		}
	});

	counts = [];
	for (const [country, freq] of Object.entries(count_dict)) {
		counts.push({"country": country, "count": freq});
	}
	return counts;
}