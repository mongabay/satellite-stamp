import moment from 'moment';
import omit from 'lodash/omit';

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

/**
 * Return a list of dates (string) between to dates
 * @param {string[]} dates Date interval
 * @param {moment.unitOfTime.Diff} interval Basic unit to compute the dates (day, month, year, etc.)
 * @param {string} format Moment format
 * @param {Object<number, string>} [marks] List of dates
 */
export const getDatesFromInterval = (dates, interval, format, marks) => {
  const startDate = moment(dates[0]);
  const endDate = moment(dates[1]);

  if (marks) {
    return new Array(Object.keys(marks).length).fill(null).map((_, index) => {
      const date = moment(startDate).add(+Object.keys(marks)[index], interval);

      return {
        label: date.format(format),
        value: date.format('YYYY-MM-DD'),
      };
    });
  }

  return new Array(endDate.diff(startDate, interval) + 1).fill(null).map((_, index) => {
    const date = moment(startDate).add(index, interval);

    return {
      label: date.format(format),
      value: date.format('YYYY-MM-DD'),
    };
  });
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
            : undefined,
          omit(layerSettings, 'dateRange')
        )
      : layer.config.source,
  opacity: layerSettings.opacity,
  visibility: layerSettings.visible,
  // We need to add 3: +1 because it can't be 0, +1 to be on top of external basemaps and +1 to be
  // on top of the recent imagery
  zIndex: layerSettings.order + 3,
  ...(layer.decodeParams
    ? {
        decodeParams: {
          ...layer.decodeParams,
          ...Object.keys(layer.params ?? {})
            .filter(key => layer.decodeParams[key] !== undefined)
            .reduce((res, key) => {
              let value = layerSettings[key] ?? layer.params[key].default;
              if (typeof value === 'boolean') {
                value = value ? 1 : 0;
              }

              return {
                ...res,
                [key]: value,
              };
            }, {}),
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

export const getBasemapDef = (basemapId, basemap, basemapSettings) => {
  if (!basemap.url) {
    return null;
  }

  let basemapUrls;
  if (typeof basemap.url === 'function') {
    basemapUrls = basemap.url(basemapSettings);

    if (basemapUrls === null) {
      return null;
    }
  } else if (Array.isArray(basemap.url)) {
    basemapUrls = basemap.url;
  } else {
    basemapUrls = [basemap.url];
  }

  if (typeof basemap.url !== 'function' && basemapSettings) {
    basemapUrls = basemapUrls.map(url =>
      Object.keys(basemapSettings).reduce(
        (res, key) => url.replace(`{${key}}`, basemapSettings[key]),
        url
      )
    );
  }

  return {
    id: basemapId,
    type: 'raster',
    source: {
      type: 'raster',
      tiles: basemapUrls,
      minzoom: basemap.minZoom,
      maxzoom: basemap.maxZoom,
    },
    zIndex: 1, // 1 is the minimum we can assign
  };
};

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
  const contextualLayerStyleGroups = contextualLayers
    .filter(l => l.styleGroup)
    .map(l => l.styleGroup);

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
