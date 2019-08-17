import { bisector } from "d3-array";
import { select, mouse } from "d3-selection";

export const bisectTooltip = (data, graph, xScale, yScale, graphWidth, graphHeight, xValue, yValue) => {

  // BISECTOR
  // We use this to figure out where the mouse is in relation to the x Axis
  var bisect = bisector(xValue).left;

  // GET DOM ELEMENTS
  // Most of these were set up in our init func in index.js with specific class names
  const focusCircle = graph.selectAll(".bi-tooltip__circle");
  const focusTooltip = select('body').selectAll(".bi-tooltip__tooltip");
  const focusRect = graph.selectAll(".bi-tooltip__rect");

  // Create the circle that travels along the curve of chart
  focusCircle
      .attr('r', 8.5)
      .style("opacity", 0)

  // Create div that travels along the curve of chart
  focusTooltip
      .style("opacity", 0)

  // Create a rect on top of the svg area: this rectangle recovers mouse position
  focusRect
    .style("fill", "none")
    .style("pointer-events", "all")
    .attr('width', graphWidth)
    .attr('height', graphHeight)
    .on('mouseover', handleMouseover)
    .on('mousemove', handleMousemove)
    .on('mouseout', handleMouseout);

    // What happens when the mouse move -> show the annotations at the right positions.
    function handleMouseover() {
      focusCircle.style("opacity", 0.9)
      focusTooltip.style("opacity",0.9)
    }
  
    function handleMousemove() {
      // recover coordinate we need
      var x0 = xScale.invert(mouse(this)[0]);
      var i = bisect(data, x0, 1);
      const selectedData = data[i]
      focusCircle
        .attr("cx", xScale(xValue(selectedData)))
        .attr("cy", yScale(yValue(selectedData)))
      // DISIPLAY TOOL TIP
      const formattedValue = yValue(selectedData) + " units" // formatting our display value
      focusTooltip.html(`<span class="bi-tooltip__value">${formattedValue}</span>`) // display text
      // POSITION TOOLTIP
      // Because our tooltip is independent of the SVG canvas, we first need to get the DOM coordinates
      // of focusCircle, we then use those coordinates to position focusTooltip.
      const tooltipXOffset = 8.5
      const tooltipYOffset = -22
      const focusCircleDomProps = document.getElementById("bi-tooltip__circle").getBoundingClientRect()
      const tooltipWidth = document.getElementById("bi-tooltip__tooltip").offsetWidth; // get width of tooltip for collision detection
      const viewPortWidth = document.body.clientWidth; // get width of viewport for collision detection
      // if tooltip width + focusCircleDomProps.left is greater than viewport width,
      // flip the tooltip to display on left rather than right.
      if (focusCircleDomProps.left + tooltipWidth > viewPortWidth) {
      focusTooltip
        .style("left", focusCircleDomProps.left + tooltipXOffset - tooltipWidth + "px")
        .style("top", focusCircleDomProps.top + tooltipYOffset + "px")
      } else {
      focusTooltip
        .style("left", focusCircleDomProps.left + tooltipXOffset + "px")
        .style("top", focusCircleDomProps.top + tooltipYOffset + "px")  
      }
    }

  function handleMouseout() {
    focusCircle.style("opacity", 0)
    focusTooltip.style("opacity", 0)
  }
}