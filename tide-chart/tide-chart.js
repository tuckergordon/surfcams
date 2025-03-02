import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { fetchTides } from "./tides.js";

const tideData = await fetchTides();

tideChart(tideData);

function tideChart(
  tideData,
  margin = { top: 30, right: 25, bottom: 20, left: 25 }
) {
  const parseTime = d3.timeParse("%I:%M %p");
  tideData.forEach((d) => (d.parsedTime = parseTime(d.time)));

  const svg = d3.select(".tide-chart");
  const width = +svg.attr("width");
  const height = +svg.attr("height");

  const x = d3
    .scaleTime()
    .domain(d3.extent(tideData, (d) => d.parsedTime))
    .range([margin.left, width - margin.right]);

  const y = d3
    .scaleLinear()
    .domain([
      d3.min(tideData, (d) => d.height) - 1,
      d3.max(tideData, (d) => d.height) + 1,
    ])
    .range([height - margin.bottom, margin.top]);

  // Line
  const line = d3
    .line()
    .x((d) => x(d.parsedTime))
    .y((d) => y(d.height))
    .curve(d3.curveCatmullRom);

  svg.append("path").datum(tideData).attr("class", "tide-line").attr("d", line);

  // Area
  const area = d3
    .area()
    .x((d) => x(d.parsedTime))
    .y0(height - margin.bottom)
    .y1((d) => y(d.height))
    .curve(d3.curveCatmullRom);

  svg.append("path").datum(tideData).attr("class", "tide-area").attr("d", area);

  // X axis
  svg
    .append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(
      d3
        .axisBottom(x)
        .ticks(5)
        .tickSize(4)
        .tickFormat((d) => {
          const formatHour = d3.timeFormat("%-I%p");
          let formattedTime = formatHour(d).toLowerCase();
          if (formattedTime === "12pm") {
            formattedTime = "Noon";
          }
          return formattedTime;
        })
    )
    .call((g) => g.select(".domain").remove()) // Remove the axis line


  // High and Low tide marks
  const highLowGroup = svg.append("g").attr("class", "group-high-low");

  tideData.forEach((d) => {
    if (d.type === "high" || d.type === "low") {
      highLowGroup
        .append("line")
        .attr("class", `line-${d.type}`)
        .attr("x1", x(d.parsedTime))
        .attr("x2", x(d.parsedTime))
        .attr("y1", y(d.height))
        .attr("y2", height - margin.bottom);

      highLowGroup
        .append("text")
        .attr("x", x(d.parsedTime))
        .attr("y", y(d.height) - 10)
        .text(`${d.height}ft`);

      highLowGroup
        .append("text")
        .attr("text-anchor", "middle")
        .attr("font-size", "10px")
        .attr("font-weight", "700")
        // .attr("font-family", "Linear Sans")
        .attr("line-height", "16px")
        .attr("fill", "#171717")
        .attr("x", x(d.parsedTime))
        .attr("y", y(d.height) - 22)
        .text(d3.timeFormat("%I:%M %p")(d.parsedTime));
    }
  });

  // Current time vertical line
  const currentTime = new Date();
  const parsedCurrentTime = parseTime(d3.timeFormat("%I:%M %p")(currentTime));

  svg
    .append("line")
    .attr("class", "line-current")
    .attr("x1", x(parsedCurrentTime))
    .attr("x2", x(parsedCurrentTime))
    .attr("y1", margin.top - 5)
    .attr("y2", height - margin.bottom + 5);
}
