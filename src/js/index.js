
/* ---------------------------------------------------------------
                    BOILERPLATE - LINE CHART, SINGLE SERIES - DYNAMIC
-----------------------------------------------------------------*/
/*
A dyanmic and responsive line chart for single series. Chart is redrawn when:
- A) a new option is chosen from select element
- B) element is resized.

Chart's responsiveness follows 'progressive disclosure' philosophy. More parts of the graph
appear in the DOM as the graph is resized. To adjust these elements, including margins, adjust
chart.js

When adapting this boilerplate don't forget to change:
- filenames and data names in loadAndProcessData
- object key names in parse.js
- object key names in chart.js
- object key names in bi-tooltip.js

 */


// --------------------------- IMPORTS ---------------------------

// Third party
import {select} from 'd3-selection'
import debounce from 'debounce';

// My imports
import { loadAndProcessData } from "./loadAndProcessData";
import { createDropdownSelector, onDropdownChange } from "./dropdownSelector";
import { drawChart } from './chart';
// --------------------------- CANVAS SETUP AND BASIC PROPS ---------------------------

  // SET BASIC PROPS
  const heightRelativeToWidth = 0.62 // instead of setting fixed height, set it as a ratio of width (Note: 'golden ratio' is 0.618)
  const breakpointSmallScreen = 400;
  const animationDuration = 500

  // SET ELEMENT PROPS
  const graphicContainer = select('.container__graphic') // container
  const svg = graphicContainer.select('.graphic__svg') // our svg canvas
  const graphicInner = graphicContainer.select(".graphic__inner"); // a largely useless div, we just need this so we can get accurate dimensions for responsiveness
  const graph = svg.append('g') // the main group in our svg - everything is appended to this
    .attr('class','graphic__group')

  // STORE PROPS
  const props = {
    svg,
    graph,
    graphicInner,
    heightRelativeToWidth,
    breakpointSmallScreen,
    animationDuration
  }

// --------------------------- LOAD DATA AND DRAW GRAPHIC ---------------------------

loadAndProcessData().then(rawData => {

  // --------------------------- RESIZE ---------------------------

  // This function is probably unecessary, it can be deleted if you can figure out how to pass args into a func that's being debounced
  function resize() {
    drawChart(rawData, props)
  }

  // --------------------------- CREATE DROPDOWN SELECTOR ---------------------------
  
  // Builds dropdown options based on raw data
  createDropdownSelector(rawData)

  // -------------------------- LISTEN FOR DROPDOWN CHANGES ---------------------------

  // Redraws chart if new dropdown option selected
  select(".dropdown").on("change", function() {
    const animatedUpdate = true; // passing this as arg into drawChart will cause bars to animate
    drawChart(rawData, props);
  });

  // ------------------------------------- INIT ----------------------------------
  
  /* Sets up groups before we draw our chart, this is to stop from creating duplicate groups
  every time we re-draw chart.
  */
  function init() {

    // AXIS LABELS
    // Set yAxis label to class 'yAxis-label'
    graph
      .append('text')
      .attr('class','yAxis-label')
    
    // Set xAxis label to class 'xAxis-label'
    graph
      .append('text')
      .attr('class','xAxis-label')

    // AXIS GROUPS
    // Create axisX group with class 'axisX'
    graph
      .append('g')
      .attr('class','axisX')
      .attr('id','axisX')
    
    // Create axisY group with class 'axisY'
    graph
      .append('g')
      .attr('class','axisY')
      .attr('id','axisY')


    // add event listner for any resizes (listener is debounced)
    window.addEventListener("resize", debounce(resize, 200));
    drawChart(rawData, props);
  }

  // ------------------------------------- START ----------------------------------

  init()

});



