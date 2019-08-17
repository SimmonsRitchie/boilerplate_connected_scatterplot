/* ---------------------------------------------------------------
                MODULE: DROP DOWN SELECTOR
-----------------------------------------------------------------*/
/* 
Creates our drop down selector for our datatable.

Takes in data, gets distinct values, and appends distinct items as options to
a selector in index.html using jQuery selectors.

NOTE: An earlier version of this module required setting names of data groups here. Instead,
set names of data groups in loadAndProcessData module.
*/

// --------------------------- IMPORTS ---------------------------

// third party imports
import {select} from 'd3-selection'

// my imports
import { resize } from './index'

// --------------------------- BUILD DROPDOWN ---------------------------

export const createDropdownSelector = (data) => {

  // first get unique items from data
  const dataLabels = Object.keys(data)
  
  // then selecting dropdown
  let dropDown = select('.dropdown')

  // then adding options based on items in data
  let options = dropDown
    .selectAll("option")
    .data(dataLabels)
    .enter()
    .append("option")

  // then adding option values and text
  options
    .text( d => d)
    .attr("value", function(d) {
      return d;
    });
}

// --------------------------- ON DROPDOWN CHANGE---------------------------

// filters the data whenever the dropdown is selected
export const onDropdownChange = (value, data) => {
    resize();
  }

// --------------------------- ON DROPDOWN CHANGE---------------------------

// Filters data based on current select input
export const getDropdownVal = () => {
  const sel = document.getElementById("dropdown"); // get dropdown element
  return sel.options[sel.selectedIndex].value; // get current value of select
};
