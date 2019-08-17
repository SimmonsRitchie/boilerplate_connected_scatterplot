/* ---------------------------------------------------------------
                    MODULE: RELAX LABEL SPACING
-----------------------------------------------------------------*/

/* This module generates label positions with RELAXED spacing.

In essence, if it's determined that labels may overlap, label Y positions are nudged up or down.
*/

export const relaxSpacing = (inputData, xScale, yScale, xValue, yValue, graphHeight) => {
  
    // CREATE NEW OUTPUT OBJECT WITH LABELS BASED ON X AND Y SCALES
    // First, we extract the last values in our array of scatterplot/line graph points
    // We then run those values through our xScale and yScale to get the proper position of our labels on the SVG.
    // We create a new object with these values. It's important we create a new object because if we try to change the prop values on 'inputData' we
    // will inadvertently mutate the data outside of this function.
    let outputData = inputData.map(group => {
        return {
          ...group, // adds all original object props to new obj
          labelPosX: xScale(xValue(group.values[group.values.length -1])), // we want the last point in our line graph so that our label is aligned with it
          labelPosY: yScale(yValue(group.values[group.values.length -1])) // we want the last point in our line graph so that our label is aligned with it
        }
      });

    const spacing = 15 // this is in pixels, adjust this value if your labels are using a larger or smaller font size
    outputData = collisionDetection(outputData, spacing, graphHeight) // we now cycle through our array and adjust labelYPos if there are overlapping labels

  return outputData;
}


const collisionDetection = (array, spacing, graphHeight) => {
  /*
  Takes an array of objects that has a property 'labelPosY'.
  Compares labelPosY for each obj and nudges each position up or down if collisions are detected.
  Keeps looping over array until no more overlaps are detected.
  
  PARAMS
  -- array (arr)
  An array of objects with a property of 'labelPosY', eg: [{name: "hbo", labelPosY: 20},{name: "netflix", labelPosY: 30}]
  
  -- spacing (int)
  The number of pixels we estimate will be the height of each label. Adjust this based on font size or if you want more padding between final label positions.
  
  -- graphHeight (int)
  The total height of your graph. Labels won't be nudged below this point.
  */


  // SETUP
  // we first sort our array based on Y position so they're from lowest to highest.
  // this is to imitate how the labels would look if they were displayed in the SVG normally, highest label to lowest label.
  // (because, remember, y coordinates start from 0 at top of SVG.
  array = array.sort((a, b) => a.labelPosY - b.labelPosY) 
  // We cycle through each pair of indices in array so we set our total number of loops as the length of the array minus one
  const loopCount = array.length - 1
  // we start a counter to count the number of times there's no collision between pairs
  let noCollisionCount = 0 
  
  // OUTER LOOP
  // We loop until we have no collisions between any of our pairs. We determine this by counting each time there isn't a collision with the counter above.
  while (noCollisionCount < loopCount) { 

    // INNER LOOP
    /* This loop does the grunt work: it cycles through each obj in our array, comparing the y value of the obj to the y position of the next object in the array.
    It calls these values: valA and valB.
    It then adds 'spacing' (ie. the estimated height of each label) to valA to estimate its lowest Y point in the SVG.
    IF: the Y position of valB is less than ValA + spacing, then we have a collision.
    THEN: we move valA up one pixel (ie. minus 1 from its y position) and we move valB down one pixel (ie. add 1 to its y position)
    HOWEVER, if valB's new position would push it further than the total height of the graph (graphHeight) then we don't add anything to its y position.
    We then reset the noCollisionCounter to 0 and move on to the next index in the array and repeat the process.
    ELSE IF there are no collisions at all between valA and valB, then we add 1 to the noCollisionCounter and move on.
    */
    for (let sliceIdx = 0; sliceIdx < loopCount; sliceIdx++) { // cycle through each index in array except for last
      let valA = array[sliceIdx].labelPosY // get y position of label
      let valB = array[sliceIdx + 1].labelPosY // get y position of next label in array
      if (valB < valA + spacing) { // check if the topmost position of valB overlaps with the bottom position of valA
        array[sliceIdx].labelPosY -= 1 // if so, subtract one from y position of valA
        if (array[sliceIdx + 1].labelPosY < graphHeight) { // check we're not at the bottom of the graph, 
          array[sliceIdx + 1].labelPosY += 1 // if not, add one to y position of valB
        }
        noCollisionCount = 0 // reset 'noCollisionCount'
      } else {
        // If there's no collisions between valA and valB, that's great, add one to our 'noCollisionCount'
        // If we don't have any any collisions in the entire innerloop, we'll exit from the outerloop
        noCollisionCount += 1 
      }
    }
  }
  // We've now broken out of our outer loop. If collisions were detected, y positions have been altered in our array.
  return array
}