import { createSlice, createSelector } from '@reduxjs/toolkit';
import omit from 'lodash/omit';

import { getLayerDef, getDatesFromInterval, getBasemapDef, computeDecodeParams } from 'utils/map';
import { BASEMAPS, DATA_LAYERS } from 'components/map';

export const SLICE_NAME = 'map';

export const selectViewports = state => state[SLICE_NAME].viewports;
export const selectBasemap = state => state[SLICE_NAME].basemap;
export const selectBasemapParams = state => state[SLICE_NAME].basemapParams;
export const selectContextualLayers = state => state[SLICE_NAME].contextualLayers;
export const selectRecentImagery = state => state[SLICE_NAME].recentImagery;
export const selectLayers = state => state[SLICE_NAME].layers;
export const selectDataLayers = () => DATA_LAYERS;
export const selectInsetMap = state => state[SLICE_NAME].insetMap;
export const selectRestoring = state => state[SLICE_NAME].restoring;
export const selectIdle = state => state[SLICE_NAME].idle;

export const selectBasemapLayerDef = createSelector(
  [selectBasemap, selectBasemapParams],
  (basemap, basemapParams) => getBasemapDef(basemap, BASEMAPS[basemap], basemapParams)
);

export const selectActiveDataLayers = createSelector([selectLayers], layers => Object.keys(layers));

export const selectActiveDataLayersInteractiveIds = createSelector(
  [selectActiveDataLayers],
  activeDataLayers =>
    activeDataLayers
      .filter(layerId => DATA_LAYERS[layerId].config.interactiveLayerIds)
      .reduce((res, layerId) => [...res, ...DATA_LAYERS[layerId].config.interactiveLayerIds], [])
);

export const selectExportTemporalDiffLayers = createSelector(
  [selectActiveDataLayers, selectBasemap],
  (dataLayers, basemap) => {
    const hasTemporalData = layer => !!layer.legend?.timeline;

    let layers = dataLayers.filter(layer => hasTemporalData(DATA_LAYERS[layer]));
    if (hasTemporalData(BASEMAPS[basemap])) {
      layers.push(basemap);
    }

    return layers.reduce((res, layer) => {
      const { minDate, maxDate, interval, dateFormat, marks } = (
        DATA_LAYERS[layer] ?? BASEMAPS[layer]
      ).legend.timeline;
      return {
        ...res,
        [layer]: getDatesFromInterval([minDate, maxDate], interval, dateFormat, marks),
      };
    }, {});
  }
);

export const selectLegendDataLayers = createSelector(
  [selectDataLayers, selectActiveDataLayers, selectLayers],
  (dataLayers, activeDataLayers, layers) => {
    const activeLayers = Object.keys(dataLayers)
      .map(layerId => ({
        ...dataLayers[layerId],
        id: layerId,
      }))
      .filter(layer => activeDataLayers.indexOf(layer.id) !== -1);

    const layerGroups = activeLayers.map(layer => ({
      id: layer.id,
      dataset: layer.id,
      visibility: layers[layer.id].visible,
      readonly: false,
      layers: [
        {
          name: layer.label,
          opacity: layers[layer.id].opacity,
          order: layers[layer.id].order,
          legendConfig: {
            ...layer.legend,
            items:
              typeof layer.legend.items === 'function'
                ? layer.legend.items(
                    layers[layer.id].dateRange
                      ? computeDecodeParams(layer, {
                          dateRange: layers[layer.id].dateRange,
                          currentDate: layers[layer.id].currentDate,
                        }).endYear
                      : undefined
                  )
                : layer.legend.items,
          },
          timelineParams: layer.legend?.timeline
            ? {
                ...layer.legend?.timeline,
                startDate: layers[layer.id].dateRange?.[0] || layer.legend?.timeline.minDate,
                endDate: layers[layer.id].currentDate || layer.legend?.timeline.maxDate,
                trimEndDate: layers[layer.id].dateRange?.[1] || layer.legend?.timeline.maxDate,
              }
            : undefined,
        },
      ],
    }));

    const sortedLayerGroups = layerGroups.sort((groupA, groupB) =>
      groupA.layers[0].order < groupB.layers[0].order ? 1 : -1
    );

    return sortedLayerGroups;
  }
);

export const selectActiveLayersDef = createSelector(
  [selectBasemapLayerDef, selectDataLayers, selectActiveDataLayers, selectLayers],
  (basemapLayerDef, dataLayers, activeDataLayers, layers) => [
    ...activeDataLayers.map(layerId => getLayerDef(layerId, dataLayers[layerId], layers[layerId])),
    ...(basemapLayerDef ? [basemapLayerDef] : []),
  ]
);

export const selectSerializedState = createSelector(
  [
    selectViewports,
    selectBasemap,
    selectBasemapParams,
    selectContextualLayers,
    selectRecentImagery,
    selectLayers,
    selectInsetMap,
  ],
  (viewports, basemap, basemapParams, contextualLayers, recentImagery, layers, insetMap) => {
    return {
      viewports: viewports.map(viewport => omit(viewport, 'transitionDuration', 'bounds')),
      basemap,
      basemapParams: omit(basemapParams, 'key'),
      contextualLayers,
      recentImagery,
      layers,
      insetMap,
    };
  }
);

export default toolActions =>
  createSlice({
    name: SLICE_NAME,
    initialState: {
      restoring: true,
      // Each viewport correspond to a map
      viewports: [
        {
          zoom: 2,
          latitude: 27,
          longitude: 12,
          transitionDuration: 250,
          bounds: null,
        },
      ],
      // Whether each map is idle
      idle: [true],
      basemap: 'mongabay-paper',
      basemapParams: null,
      contextualLayers: ['labels-none', 'hillshade'],
      recentImagery: null,
      insetMap: false,
      layers: {
        'tree-cover': {
          visible: true,
          opacity: 1,
          order: 0,
        },
        'primary-forests': {
          visible: true,
          opacity: 1,
          order: 1,
        },
      },
    },
    reducers: {
      updateViewports(state, action) {
        state.viewports = new Array(state.viewports.length).fill(action.payload);
      },
      updateViewport(state, action) {
        const { index, viewport } = action.payload;
        const { transitionDuration } = state.viewports[index];

        state.viewports.splice(index, 1, {
          ...viewport,
          transitionDuration,
        });
      },
      updateIdle(state, action) {
        const { index, idle } = action.payload;
        state.idle.splice(index, 1, idle);
      },
      updateBasemap(state, action) {
        state.basemap = action.payload.basemap;
        state.basemapParams = action.payload.params || null;
      },
      updateBasemapParams(state, action) {
        state.basemapParams = action.payload;
      },
      addContextualLayer(state, action) {
        const layerIndex = state.contextualLayers.indexOf(action.payload);
        if (layerIndex === -1) {
          state.contextualLayers.push(action.payload);
        }
      },
      removeContextualLayer(state, action) {
        const layerIndex = state.contextualLayers.indexOf(action.payload);
        if (layerIndex !== -1) {
          state.contextualLayers.splice(layerIndex, 1);
        }
      },
      updateContextualLayers(state, action) {
        state.contextualLayers = action.payload;
      },
      updateRecentImagery(state, action) {
        state.recentImagery = action.payload;
      },
      addLayer(state, action) {
        state.layers[action.payload] = {
          visible: true,
          opacity: 1,
          // Like z-index, the higher = on top
          order: Object.keys(state.layers).length,
        };
      },
      removeLayer(state, action) {
        const order = state.layers[action.payload].order;

        delete state.layers[action.payload];

        // We make sure to update the order of all the layers
        Object.keys(state.layers).forEach(layerId => {
          if (state.layers[layerId].order > order) {
            state.layers[layerId].order -= 1;
          }
        });
      },
      updateActiveLayers(state, action) {
        state.layers = {};
        action.payload.forEach((layerId, index) => {
          state.layers[layerId] = {
            visible: true,
            opacity: 1,
            // Like z-index, the higher = on top
            order: index,
          };
        });
      },
      updateLayer(state, action) {
        state.layers[action.payload.id] = {
          ...state.layers[action.payload.id],
          ...omit(action.payload, 'id'),
        };
      },
      updateLayerOrder(state, action) {
        const mapLayerToOrder = action.payload
          // We remove the IDs that correspond to the boundaries
          .filter(layerId => !!DATA_LAYERS[layerId])
          .reduce((res, layerId, index) => ({ ...res, [layerId]: index }), {});

        Object.keys(state.layers).forEach(layerId => {
          state.layers[layerId].order = mapLayerToOrder[layerId];
        });
      },
      updateInsetMap(state, action) {
        state.insetMap = action.payload;
      },
    },
    extraReducers: {
      [toolActions.restoreState.fulfilled]: (state, action) => {
        const stateToRestore = action.payload[SLICE_NAME] || {};

        return {
          ...state,
          ...stateToRestore,
          restoring: false,
          layers: {
            ...(stateToRestore.layers ?? state.layers),
          },
          contextualLayers: [...(stateToRestore.contextualLayers ?? state.contextualLayers)],
        };
      },
      [toolActions.updateMode.toString()]: (state, action) => {
        switch (action.payload) {
          case '1':
          case 'animated':
            state.viewports = [{ ...state.viewports[0] }];
            state.idle = [state.idle[0]];
            return;

          case '2-vertical':
          case '2-horizontal':
            // Since the default difference is spatial, we try to maintain the map positions
            // See: modules/tool/export/index.js
            state.viewports = new Array(2)
              .fill(null)
              .map((_, index) => ({ ...(state.viewports[index] ?? state.viewports[0]) }));
            state.idle = Array(2)
              .fill(null)
              .map((_, index) => state.idle[index] ?? true);
            return;

          case '4':
            // Since the default difference is spatial, we try to maintain the map positions
            // See: modules/tool/export/index.js
            state.viewports = new Array(4)
              .fill(null)
              .map((_, index) => ({ ...(state.viewports[index] ?? state.viewports[0]) }));
            state.idle = Array(4)
              .fill(null)
              .map((_, index) => state.idle[index] ?? true);
            return;

          default:
        }
      },
      [toolActions.updateMapDifference.toString()]: (state, action) => {
        if (action.payload === 'temporal') {
          state.viewports = state.viewports.map((viewport, index) => {
            if (index === 0) {
              return viewport;
            }
            return { ...state.viewports[0] };
          });
        }
      },
    },
  });
