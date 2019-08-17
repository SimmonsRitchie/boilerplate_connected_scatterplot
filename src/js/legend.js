/* ---------------------------------------------------------------
                    MODULE: LEGEND
-----------------------------------------------------------------*/
/*
This module uses d3-svg-legend to create our legend. Pass in your scale and SVG legend will be returned.

NOTE: This is unused in this graphic, but leaving this here in case it's useful in future.

Here's an example of how to config and call it:

  const legendProps = {
    scale: colorScale,
    legendCanvasElement: ".legend",
    width: width,
    legendPosY: 0, // determines how close legend is to map on Y axis
    heightRatio: 0.1,
    shapePadding: 20,
  }
  createSvgLegend(legendProps) // Build the legend

Use these styles:

// LEGEND SVG
// SVG dimensions can get wacky when they're inside flexboxs. Using this to ensure svg appears.
.legend {
  display: flex;
  justify-content: center;
  align-items: center;

  // LEGEND CANVAS
  svg {
    width:100%;
    height: auto;
    display: block;
    margin: auto;
  }
}
*/


import { legendColor, legendHelpers } from "d3-svg-legend";
import { format } from "d3-format";
import {select} from 'd3-selection'

export const createSvgLegend = (props) => {

// DESTRUCTURE PROPS
const {
  scale,
  legendCanvasElement,
  width,
  legendPosY,
  heightRatio,
  shapePadding,
} = props

// REMOVE LEGEND CANVAS IF IT ALREADY EXISTS
select(legendCanvasElement).selectAll('svg').remove()

// SELECT LEGEND
const legendCanvas = select(legendCanvasElement)
  .append("svg")
  .attr('width',width)
  .attr('height',width * heightRatio)
  // .attr("viewBox", "0 0 " + legendSvgWidth + " " + legendSvgHeight)
  // .attr("preserveAspectRatio", "xMinYMin");


// CREATE LEGEND GROUP
const legendGroup = legendCanvas.append('g')
  .attr("class", "legend__group")
  .attr("id","legend__group");

// CREATE SVG LEGEND
const legend = legendColor()
  .orient("horizontal")
  .cells(6)
  .labelFormat(format(".0f"))
  .shape("rect")
  .shapePadding(shapePadding)
  .shapeHeight(3)
  .shapeWidth(25)
  .labelWrap(30)
  .labelAlign("middle")
  .labelOffset(8)
  .scale(scale);

// CALL LEGEND
legendGroup.call(legend);

// CENTER LEGEND
// To center our SVG legend, we first get its rendered width. We combine this with width of SVG to center it.
const width_of_rendered_legend = document.getElementById("legend__group").getBBox().width;
const legendPosX = width / 2 - width_of_rendered_legend / 2;
legendGroup.attr('transform',`translate(${legendPosX},${legendPosY})`)

return ;
}

