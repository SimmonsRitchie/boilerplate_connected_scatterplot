
/* ---------------------------------------------------------------
                    MODULE: PARSE
-----------------------------------------------------------------*/
/* Handles data parsing */


// MULTI-LINE SCATTER
export const multipleColumnsToSeries = (dataGroup, customLabels = false) => {

  /*
  A  function for converting CSV data in columns into an array of objects that has a 'values' property
  with a list of {x, y} tuples. This structure is needed for multi-series scatter plots.

  PARAMS

  -- data (obj)
  CSV data converted by D3 with additional metadata supplied by user.
  This function assumes the CSV data is in this format and you want the first column as the X axis:

    year, data1, data2, data3
    2001, 10, 20, 30
    2002, 30, 40, 50
    
  -- customLabel (optional, obj)
  optional, Obj, a custom obj of names to display in graph as the series.
  Passed in format dataGroupName: customLabelName EG {"data1": "hbo", "data2": "netflix"}

  If no arg passed, then defaults to original column names. We use this because sometimes data names are
  not ideal for displaying in actual graph. 
  */

  // DESTRUCTURE PROPS
  const {
    data, // our core data for parsing
    xValParser, // parses xAxis values (eg. converting to datetime object)
    yValParser // parses yAxis values (eg. converting to int)
  } = dataGroup

  // GET X-AXIS DATA LABEL FOR GROUP
  const xAxisName = data.columns[0]

  // GET NAMES OF EACH SERIES IN GROUP
  const arrayOfSeriesNames = data.columns.splice(1) // creates new array with all columns name except for first col, which is our xAxis

  // Convert the data into an array of objects with {x, y} tuples
  const dataReady = arrayOfSeriesNames.map( series => { // .map allows to do something for each element of the list
    return {
      name: series, // this is the actual name of the data series
      label: customLabels[series] ? customLabels[series] : series, // this is the custom label, defaults to data group name
      // CREATE X AND Y TUPLES
      values: data.map(d => { // 'values' pop is the array of x, y tuples
        return {xVal: xValParser(d[xAxisName]), yVal: yValParser(d[series])}; // we create the tuples here, using our desired x value and y value in the data
      })
    };
  });

  return dataReady
}

// FLATTEN OBJECT

export const flattenValuesIntoArray = (data, valueAccessor) => {

  /* PARAMS
  
  This function gets array of value tuples inside our data object for multi-series scatterplot and flattens them into a single array
  We can then use this new array to get the highest and lowest value to build our domain.
  
  -- data (obj)
  An array of objects. Each object represents a series. They have this structure:
    data = [
      {"name": "hbo", label:"HBO",values:{year: "2001", value: 5 }},
      {"name": "netflix", label:"Netflix",values:{year: "2001", value: 2 }},
    ]
  
  -- valueAccessor (func)
  A function that gets the desired property from our 'values' objects. Eg:
    valueAccessor = d => d.value
  */
 
  const result = data.map((d) => { // first we use map to get the 'values' arrays from each series
    return d.values
  })
  .flat() // we flatten those objects into one big array
  .map(valueAccessor) // we go through each object and pull out our desired value
  return result
}
