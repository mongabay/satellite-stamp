/**
 * Return a new version of the layer where the legend items are the ones of the specific group
 * @param {object} layer Layer object
 * @param {string} groupName Name of the group to extract the legend items from
 */
export const getLayerWithFilteredLegendItems = (layer, groupName) => ({
  ...layer,
  legendConfig: {
    type: 'basic',
    items: layer.legendConfig.items.find(item => item.name === groupName)?.items ?? [],
  },
});
