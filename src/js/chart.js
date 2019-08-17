
/* ---------------------------------------------------------------
                    MODULE: CHART
-----------------------------------------------------------------*/

/* This function draws the chart. It also updates it in response to data changes using D3's
standard update pattern.

Note1: After the graphic is drawn, height of page is sent to PymParent. This is to fix a bug
where iframe height wasn't updating properly on parent page.
*/

// --------------------------- IMPORTS ---------------------------

// Third party
import { max, extent, bisector } from "d3-array";
import { select, mouse } from "d3-selection";
import { scaleLinear, scaleBand, scaleTime, scaleOrdinal } from "d3-scale";
import { axisBottom, axisLeft } from "d3-axis";
import { transition } from "d3-transition";
import { line, curveBasis } from 'd3-shape';
import { schemeSet2} from 'd3-scale-chromatic';

// My imports
import { filterData } from "./filter";

import { tooltipOn, tooltipOff } from "./tooltip";
import { flattenValuesIntoArray } from './parse';
import { relaxSpacing } from './relaxSpacing'
// --------------------------- DRAW CHART ---------------------------

export const drawChart = (rawData, props, animatedUpdate=false) => {


  //-------------------- SET UP ------------------------

  // REFINE DATA BASED ON DROPDOWN
  const selectedData = filterData(rawData); // filtering data based on current dropdown selection, includings data + metadata
  const data = selectedData.data // filtering just the core data object, eg. {name: 'blah', label: 'blah', values: [x: 'blah', y: 'blah',...]} no meta data

  // DESTRUCTURE METADATA
  const {
    yAxisLabel,
    xAxisLabel,
    yValDisplayFormat,
    xAxisTickFormat
  } = selectedData

  // DESTRUCTURE PROPS
  const {
    svg,
    graphicInner,
    graph,
    heightRelativeToWidth,
    breakpointSmallScreen,
    animationDuration
  } = props;


  // RESPONSIVE: GET WIDTH
  // We get width of graphicInner and then pass it into render to get our svg width
  const width = graphicInner.node().offsetWidth;

  // GET DOM ELEMENTS
  // Most of these were set up in our init func in index.js with specific class names
  const xAxisGroup = graph.selectAll(".axisX");
  const yAxisGroup = graph.selectAll(".axisY");
  const yAxisLabelGroup = graph.selectAll(".yAxis-label");
  const xAxisLabelGroup = graph.selectAll(".xAxis-label");

  // DEFINE X AND Y DATA
  // Define which object props you want here so that you don't have to change every property name in code
  const xValue = d => d.xVal
  const yValue = d => d.yVal

  // SET UP SVG DIMS
  // Our height is based on our width, adjust 'heightRelativeToWidth' in index.js to tweak graphic height
  const height = width * heightRelativeToWidth; // height is a ratio of width
  svg.attr("width", width).attr("height", height);

  // RESPONSIVE: SET MARGIN BASED ON SCREEN SIZE
  let margin = {}
  if (width < breakpointSmallScreen) {
    margin = { top: 10, right: 20, bottom: 50, left: 53 };
  } else {
    margin = { top: 30, right: 80, bottom: 55, left: 70 };
  }

  // SET ACTUAL GRAPH DIMS
  const graphWidth = width - margin.left - margin.right;
  const graphHeight = height - margin.top - margin.bottom;

  // POSITION GEAPH
  graph
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // POSITION X AXES
  xAxisGroup.attr("transform", `translate(0,${graphHeight})`); // shifting axis to bottom

  // CREATE Y SCALE (excluding domain)
  const yScale = scaleLinear().range([graphHeight, 0]);

  // CREATE X SCALE (excluding domain)
  const xScale = scaleTime() // scale for handling time
    .range([0, graphWidth])

  // CREATE COLOR SCALE
  // We give each line a separate color
  const dataGroups = data.map(item => item.name) // get the names of each of our series
  const colorScale = scaleOrdinal()
    .domain(dataGroups)
    .range(schemeSet2);  

  // GENERATE AXES
  const xAxis = axisBottom(xScale) // we pass in x scale so D3 knows where to position everything
    .ticks(max([graphWidth/ 90, 3])) // RESPONSIVE: at least two ticks, add more depending on height (NOTE: d3 will make judgements about what looks best, re: number of ticks)
    .tickFormat(xAxisTickFormat) // d3 uses a special time formatter

  const yAxis = axisLeft(yScale) // we pass in x scale so D3 knows where to position everything
    .ticks(max([graphHeight / 60, 3])) // RESPONSIVE: at least two ticks, add more depending on height (NOTE: d3 will make judgements about what looks best, re: number of ticks)
    .tickFormat(d => d)
    .tickSize(-graphWidth); // by setting ticksize to graphWidth we can create horizontal gridlines

  // GENERATE LINE
  // Creates our line, we need to pass in what we're using for the x and y values
  const lineGen = line()
    .x(d => xScale(xValue(d)))
    .y(d => yScale(yValue(d)))
    // .curve(curveBasis) // uncomment this if you'd like lines to curve

  //-------------------- D3 UPDATE PATTERN ------------------------

  // UPDATING DOMAINS IN SCALES
  // Domain will change every time data is updated. Adjust this for a constant domain.
  // We use extent to get min and max of data so that graph is more focused
  // NOTE: Add .nice() to round the start and end numbers
  const arrayOfYValues = flattenValuesIntoArray(data, yValue)
  const arrayOfXValues = flattenValuesIntoArray(data, xValue)
  yScale.domain([0, max(arrayOfYValues)]).nice(); //<-- DYNAMIC DOMAIN: Will change based on data
  xScale.domain(extent(arrayOfXValues)).nice() //<-- DYNAMIC DOMAIN: Will change based on data

  // RELAX
  const relaxedData = relaxSpacing(data, xScale, yScale, xValue, yValue, graphHeight)

  // 1) JOIN UPDATED DATA TO ELEMENTS
  const lines = graph.selectAll('.line').data(data)
  const dotGroup = graph.selectAll('.dotGroup').data(data)
  const dots = dotGroup.selectAll('.dot')
  const annoGroup = graph.selectAll('.anno__group').data(relaxedData)
  const annoLabels = graph.selectAll('.anno__label').data(relaxedData)
  const legendGroup = select('.container__legend').selectAll('.legend__group').data(data)
  const legendLabels = legendGroup.select('.legend__label').data(data)

  // 2) REMOVE UNEEDED LINES AND DOTS
  dotGroup.exit().remove() // removes groups of dots associated with series that are no longer in data
  dots.data(d => d.values).exit().remove() // removes dots that no longer exist within a group, we use d => d.values to access dot-level data
  lines.exit().remove()
  annoGroup.exit().remove()
  legendGroup.exit().remove()

  // 3) ENTER AND UPDATE
  // LINES
  lines.enter()
    .append('path')
    .attr('class','line')
    .merge(lines)
    .transition()
    .duration(animationDuration)
    .attr('d', d => lineGen(d.values)) // feeding in values prop
    .attr("stroke", d => colorScale(d.name)) // set stroke to name prop

  // DOTS
  // Because our dots represent multiple series, we first append a group and then
  // we add dots for each group.
  dotGroup
    .enter()
    .append("g")
    .attr("class", "dotGroup") // calling each group 'dotGroup'
    .merge(dotGroup) // if dotGroup changes, update with changes
    .style("fill", d => colorScale(d.name)) // set color for each group of dots based on name prop
    .selectAll('.dot') // grouping all elements with 'dot' class
    .data(d => d.values) // important: our data has already been bound to dotGroup, but here we are accessing the 'values' props that has the coordinates we need for each dot
    .enter()
    .append("circle")
    .attr("class", "dot") // each dot is given the class 'dot'
    .merge(dots) // important: if any dots change, update with changes
    .on("mousemove", d => tooltipOn(d, yValue, yValDisplayFormat))
    .on("mouseout", tooltipOff)
    .transition()
    .duration(animationDuration)
    .attr("cx", d => xScale(xValue(d))) // position dot: x
    .attr("cy", d => yScale(yValue(d))) // position dot: y


  // RESPONSIVE: SERIES LABELS
  // For big screens, add annotations at the end of series. For small screens, display a legend above graph.
  if (width < breakpointSmallScreen) {
    annoGroup.remove() // removes annotations from DOM if they exist
    legendGroup
      .enter()
      .append('g')
      .attr("class", "legend__group")
      .append("span")
      .merge(legendLabels)
      .attr("class", "legend__label")
      .text(d => d.label) // NOTE: We're using the 'label' prop rather than 'name', see parsing function for more info
      .style("color", d => colorScale(d.name))
  } else {
    legendGroup.remove() // removes legend from DOM if it exists
    annoGroup
    .enter()
      .append("g")
      .attr("class", "anno__group") 
      .append("text")
      .attr("class", "anno__label")
      .attr("id", d => "anno__" + d.name)
      .merge(annoLabels)
        .transition()
        .duration(animationDuration)
        .attr("transform", function(d) {return "translate(" + d.labelPosX + "," + d.labelPosY + ")"}) // Put the text at the position of the last point
        .attr("x", 12) // shift the text a bit more right of the last point
        .text( d => d.label) // NOTE: We're using the 'label' prop rather than 'name', see parsing function for more info
        .style("fill", d => colorScale(d.name))
  }

  // CALL AXES - takes groups and runs axes functions above
  xAxisGroup
    .transition()
    .duration(animationDuration)
    .call(xAxis)
  select("path.domain").remove(); // this gets rid of the Y axis line, which has the class "domain"

  yAxisGroup
    .transition()
    .duration(animationDuration)
    .call(yAxis) 
  select("path.domain").remove(); // this gets rid of the Y axis line, which has the class "domain"

  // RESPONSIVE: ROTATE X-AXIS TICK LABELS
  // For small screens, rotate labels so they're not bunched together
  if (width < breakpointSmallScreen) {
    xAxisGroup
      .selectAll("text")
      .attr("transform", "rotate(-40)") // rotate
      .attr("text-anchor", "end"); // changes rotation point (by default text anchor is in center
  } else {
    xAxisGroup
      .selectAll("text")
      .attr("transform", "rotate(0)") // rotate
      .attr("text-anchor", "center"); // changes rotation point (by default text anchor is in center
  }

  // RESPONSIVE: POSITION Y AXIS LABEL
  yAxisLabelGroup
    .data(data)
    .attr("x", 0 - graphHeight / 2)
    .attr("transform", "rotate(-90)")
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text(yAxisLabel)

  // nudge label further left small screens
  if (width < breakpointSmallScreen) {
    yAxisLabelGroup.attr("y", -46.5)
  } else {
    yAxisLabelGroup.attr("y", -53)
  }

  // RESPONSIVE: POSITION X AXIS LABEL
  const xAxisLabelYPos = graphHeight + 30; // Positions label just below xAxis group
  xAxisLabelGroup
    .attr("y", xAxisLabelYPos)
    .attr("x", graphWidth / 2) // positions label in middle of xAxis
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text(xAxisLabel);

  // hide label for small screens
  if (width < breakpointSmallScreen) {
    xAxisLabelGroup.style('visibility','hidden')
  } else {
    xAxisLabelGroup.style('visibility','visible')
  }

  // UPDATE IFRAME
  // pymChild sends the height to pym script in iframe, we do this because
  // table height changes based on user interaction.
  pymChild.sendHeight();

}