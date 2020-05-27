import moment from 'moment';

export const computeDecodeParams = (layer, { dateRange, currentDate }) => {
  const minDate = moment(layer.legend.timeline.minDate);
  const maxDate = moment(layer.legend.timeline.maxDate);

  const start = moment(dateRange[0]).isBefore(minDate) ? minDate : moment(dateRange[0]);
  const end = moment(dateRange[1]).isAfter(maxDate) ? maxDate : moment(dateRange[1]);
  const current = moment(currentDate).isAfter(maxDate) ? maxDate : moment(currentDate);

  const startDate = start;
  const endDate = current.isBefore(end) ? current : end;

  const numberOfDays = maxDate.diff(minDate, 'days');
  const startDayIndex = numberOfDays - maxDate.diff(startDate, 'days');
  const endDayIndex = numberOfDays - maxDate.diff(endDate, 'days');

  return {
    startYear: startDate.year(),
    startMonth: startDate.month(),
    startDay: startDate.dayOfYear(),
    endYear: endDate.year(),
    endMonth: endDate.month(),
    endDay: endDate.dayOfYear(),
    numberOfDays,
    startDayIndex,
    endDayIndex,
  };
};

export const getLayerDef = (layerId, layer, layerSettings) => ({
  id: layerId,
  ...layer.config,
  source:
    typeof layer.config.source === 'function'
      ? layer.config.source(
          layerSettings.dateRange
            ? computeDecodeParams(layer, {
                dateRange: layerSettings.dateRange,
                currentDate: layerSettings.currentDate,
              }).endYear
            : undefined
        )
      : layer.config.source,
  opacity: layerSettings.opacity,
  visibility: layerSettings.visible,
  // We need to add 2: +1 because it can't be 0 and +1 to be on top of external basemaps
  zIndex: layerSettings.order + 2,
  ...(layer.decodeParams
    ? {
        decodeParams: {
          ...layer.decodeParams,
          ...(layerSettings.dateRange
            ? computeDecodeParams(layer, {
                dateRange: layerSettings.dateRange,
                currentDate: layerSettings.currentDate,
              })
            : {}),
        },
      }
    : {}),
  ...(layer.decodeFunction ? { decodeFunction: layer.decodeFunction } : {}),
});

export const toggleBasemap = (map, basemap) => {
  const mapStyle = map.getStyle();
  const { layers } = mapStyle;
  const groups = mapStyle.metadata['mapbox:groups'];

  const basemapGroups = Object.keys(groups)
    .map(groupId => ({ [groupId]: groups[groupId].name }))
    .reduce((res, group) => {
      const groupId = Object.keys(group)[0];
      const groupName = group[groupId];

      if (!groupName.startsWith('basemap-')) {
        return res;
      }

      return {
        ...res,
        [groupId]: groupName,
      };
    }, {});

  const basemapGroupIds = Object.keys(basemapGroups);

  layers.forEach(layer => {
    const group = layer.metadata?.['mapbox:group'];

    if (group && basemapGroupIds.indexOf(group) !== -1) {
      map.setLayoutProperty(
        layer.id,
        'visibility',
        basemapGroups[group] === basemap.styleGroup ? 'visible' : 'none'
      );
    }
  });
};

export const toggleContextualLayers = (map, contextualLayers) => {
  const mapStyle = map.getStyle();
  const { layers } = mapStyle;
  const groups = mapStyle.metadata['mapbox:groups'];

  const contextualLayerGroups = Object.keys(groups)
    .map(groupId => ({ [groupId]: groups[groupId].name }))
    .reduce((res, group) => {
      const groupId = Object.keys(group)[0];
      const groupName = group[groupId];

      if (!groupName.startsWith('contextual-')) {
        return res;
      }

      return {
        ...res,
        [groupId]: groupName,
      };
    }, {});

  const contextualLayerGroupIds = Object.keys(contextualLayerGroups);
  const contextualLayerStyleGroups = contextualLayers.map(l => l.styleGroup);

  layers.forEach(layer => {
    const group = layer.metadata?.['mapbox:group'];

    if (group && contextualLayerGroupIds.indexOf(group) !== -1) {
      map.setLayoutProperty(
        layer.id,
        'visibility',
        contextualLayerStyleGroups.indexOf(contextualLayerGroups[group]) !== -1 ? 'visible' : 'none'
      );
    }
  });
};
