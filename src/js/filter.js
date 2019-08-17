/* ---------------------------------------------------------------
                    MODULE: FILTER
-----------------------------------------------------------------*/
/*
Determines how data will be filtered
*/

// FILTER DATA
// Filters data based on current select input
export const filterData = data => {
  const sel = document.getElementById("dropdown"); // get dropdown element
  const dropdownVal = sel.options[sel.selectedIndex].value; // get current value of select
  return data[dropdownVal];
};
