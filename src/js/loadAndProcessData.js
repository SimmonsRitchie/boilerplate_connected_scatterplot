/* ---------------------------------------------------------------
                    MODULE: LOAD AND PROCESS
-----------------------------------------------------------------*/
/*
This module gets out data and parses it if necesary
*/

// --------------------------- IMPORTS ---------------------------

// Third party
import { csv } from "d3-fetch"; // I'm using d3-fetch instead of d3-request because this tutorial is using V5 API


// My imports
import { multipleColumnsToSeries} from './parse'
import moment from "moment";
import {timeFormat} from 'd3-time-format';

export const loadAndProcessData = () =>
  // GETTING DATA USING PROMISE ALL
  // Promise all gets all data before continuing
  Promise.all([
    csv("static/dummy1.csv"),
    csv("static/dummy2.csv"),
    csv("static/dummy3.csv"),
    csv("static/dummy4.csv"),
  ]).then(([dummy1, dummy2, dummy3, dummy4]) => {

      /* ----------------- DATA GROUP PARSER ---------------------
    Below we create objects for each data file that includes instructions 
    on how they should be parsed and formatted.*/

    const xValParser = d => moment(d, 'YYYY') // In this case, we're using the same xAxisParser for multiple groups, so we just define it here. For other cases, you may need to create a new parser for each group.
    const yValParser = d => +d // just applying uniary operator to yVals to convert them to int
    const yValDisplayFormatPercent = d => `${d}%`
    const yValDisplayFormatDollars = d => `$${d}`
    const yValDisplayFormatMillion = d => `${d} mill`
    const xAxisTickFormatYear = timeFormat('%Y')
    const xAxisTickFormatDay = timeFormat('%b %e') // eg. "May 5"
    const dataGroups = [
      {
        "groupLabel":"Market share", // label used in dropdown
        "data": dummy1, // imported data
        "yAxisLabel": "Percent", // label alongside our Y axis
        "xAxisLabel": "Year", // label alongside our x Axis
        "yValDisplayFormat": yValDisplayFormatPercent, // format used when displaying y Axis values (eg "5%" or "5 mill" or "$100")
        xValParser, // function to parse imported xAxis value, eg. converting to moment object
        xAxisTickFormat: xAxisTickFormatYear, // function to determine how to display xVals, if uneeded just use d => d
        yValParser // function to parse imported yAxis values
      },{
        "groupLabel":"Audience share",
        "data": dummy2,
        "yAxisLabel": "Percent",
        "xAxisLabel": "Year",
        "yValDisplayFormat": yValDisplayFormatPercent, 
        xValParser,
        xAxisTickFormat: xAxisTickFormatYear, 
        yValParser
      },{
        "groupLabel":"Viewership",
        "data": dummy3,
        "yAxisLabel": "Viewers (millions)",
        "xAxisLabel": "Year",
        "yValDisplayFormat": yValDisplayFormatMillion,
        xValParser,
        xAxisTickFormat: xAxisTickFormatYear, 
        yValParser
      },{
        "groupLabel":"Monthly revenue",
        "data": dummy4,
        "yAxisLabel": "Revenue ($)",
        "xAxisLabel": "Year",
        "yValDisplayFormat": yValDisplayFormatDollars,
        xValParser: d => moment(d,'MM/DD/YYYY'),
        xAxisTickFormat: xAxisTickFormatDay, 
        yValParser
      }]

    // DATA SERIES: CUSTOM LABEL LOOKUP INDEX
    // Sometimes the names for our series aren't ideal for display purposes (ie. too long, too short)
    // Here we can create an index to pass in different names.
    const customLabels = {
      "hbo": "HBO",
      "netflix": "Netflix UK",
      "prime": "Amzn Prime",
      "hulu": "Hulu UK"
    }

    // PARSING DATA GROUPS
    // Loop over our datagroups and parse the 'data' payload.
    const dataReady = {}
    for (var i = 0, len = dataGroups.length; i < len; i++) {
      dataGroups[i].data = multipleColumnsToSeries(dataGroups[i], customLabels)
      dataReady[dataGroups[i].groupLabel] = dataGroups[i]
    }

    return dataReady;
  });

