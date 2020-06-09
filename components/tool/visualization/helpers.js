/**
 * Determines if the scale bar should be shown for a specific map
 * @param {number} mapIndex Index of the map
 * @param {string} mode Mode that determine the number and placement of the maps
 * @param {string} difference Difference between the maps
 */
export const shouldDisplayScaleBar = (mapIndex, mode, difference) => {
  if (mode === '1') {
    return true;
  }

  if (mode === '2-horizontal') {
    if (difference === 'spatial') {
      return true;
    }

    return mapIndex === 1;
  }

  if (mode === '2-vertical') {
    if (difference === 'spatial') {
      return true;
    }

    return mapIndex === 0;
  }

  if (mode === '4') {
    if (difference === 'spatial') {
      return true;
    }

    return mapIndex === 2;
  }

  return true;
};
