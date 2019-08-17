/* ---------------------------------------------------------------
                    MODULE: TOOLTIP
-----------------------------------------------------------------*/
/*
This module creates our tooltips. Change what data displays and how it looks below and in CSS.

Tooltip detects edge of viewport and automatically offsets itself if it's too close.
*/

import { select } from "d3-selection";


// --------------------------- TOOLTIP SETUP ---------------------------

// TOOLTIP OFFSET
// Distance between tooltip and hover location
const tooltipXOffset = 10;
const tooltipYOffset = 28;

// CREATE TOOLTIP DIV
// Set opacity to 0 initially
const tooltip = select("body")
  .append("div")
  .attr("class", "tooltip__container")
  .attr("id", "tooltip")
  .style("opacity", 0);

// MOUSE ON FUNCTION
// Changes opacity to show tooltip, positions it relative to mouse, adds map info to div
export const tooltipOn = (d, yValue, yValDisplayFormat) => {
  // DISPLAY TOOLTIP
  tooltip.style("opacity", 0.9);
  // GET INFO FOR TOOLTIP
  const value = yValDisplayFormat(yValue(d))
  // CREATE TOOLTIP DISPLAY
  tooltip.html(
    `<div class="tooltip__value">${value}</div>`
  );
  // DETERMINE WHETHER TOOLTIP IS NEAR EDGE OF VIEWPORT
  const mousePosX = event.pageX; // get mouse position X axis
  const mousePosY = event.pageY; // get mouse position y axis
  const tooltipWidth = document.getElementById("tooltip").offsetWidth; // get width of tooltip
  const viewPortWidth = document.body.clientWidth; // get width of viewport
  // if tooltip width + tooltip offset + mouseX position is greater than viewport width,
  // flip the tooltip to display on left rather than right.
  if (mousePosX + tooltipXOffset + tooltipWidth > viewPortWidth) {
    tooltip
      .style("left", event.pageX - tooltipWidth - tooltipXOffset + "px")
      .style("top", event.pageY - tooltipYOffset + "px");
  } else {
    tooltip
      .style("left", event.pageX + tooltipXOffset + "px")
      .style("top", event.pageY - tooltipYOffset + "px");
  }
};

// MOUSE OFF FUNCTION
// Return opacity to 0
export const tooltipOff = d => {
  tooltip.style("opacity", 0);
};
