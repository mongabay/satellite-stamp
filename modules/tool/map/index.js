import { createSlice, createSelector } from '@reduxjs/toolkit';
import omit from 'lodash/omit';

import { getLayerDef } from 'utils/map';
import { BASEMAPS, ATTRIBUTIONS, DATA_LAYERS } from 'components/map';

export const SLICE_NAME = 'map';

export const selectViewport = state => state[SLICE_NAME].viewport;
export const selectZoom = createSelector([selectViewport], viewport => viewport.zoom);
export const selectCenter = createSelector([selectViewport], viewport => ({
  latitude: viewport.lat,
  longitude: viewport.lng,
}));
export const selectBounds = createSelector([selectViewport], viewport => viewport.bounds);
export const selectBasemap = state => state[SLICE_NAME].basemap;
export const selectBasemapParams = state => state[SLICE_NAME].basemapParams;
export const selectContextualLayers = state => state[SLICE_NAME].contextualLayers;
export const selectLayers = state => state[SLICE_NAME].layers;
export const selectDataLayers = () => DATA_LAYERS;

export const selectBasemapLayerDef = createSelector(
  [selectBasemap, selectBasemapParams],
  (basemap, basemapParams) => {
    if (!BASEMAPS[basemap].url) {
      return null;
    }

    let basemapUrls;
    if (typeof BASEMAPS[basemap].url === 'function') {
      basemapUrls = BASEMAPS[basemap].url(basemapParams);

      if (basemapUrls === null) {
        return null;
      }
    } else if (Array.isArray(BASEMAPS[basemap].url)) {
      basemapUrls = BASEMAPS[basemap].url;
    } else {
      basemapUrls = [BASEMAPS[basemap].url];
    }

    if (typeof BASEMAPS[basemap].url !== 'function' && basemapParams) {
      basemapUrls = basemapUrls.map(url =>
        Object.keys(basemapParams).reduce(
          (res, key) => url.replace(`{${key}}`, basemapParams[key]),
          url
        )
      );
    }

    return {
      id: basemap,
      type: 'raster',
      source: {
        type: 'raster',
        tiles: basemapUrls,
        minzoom: BASEMAPS[basemap].minZoom,
        maxzoom: BASEMAPS[basemap].maxZoom,
      },
      zIndex: 1, // 1 is the minimum we can assign
    };
  }
);

export const selectActiveDataLayers = createSelector([selectLayers], layers => Object.keys(layers));

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
          legendConfig: layer.legend,
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

export const selectAttributions = createSelector(
  [selectBasemap, selectDataLayers, selectActiveDataLayers],
  (basemap, dataLayers, activeDataLayers) => {
    const basemapAttributions = BASEMAPS[basemap].attributions
      ? BASEMAPS[basemap].attributions
      : [];
    const layerAttributions = activeDataLayers
      .map(layerId => dataLayers[layerId].attributions || [])
      .reduce((res, attr) => [...res, ...attr], []);
    const uniqueAttributions = [...new Set([...basemapAttributions, ...layerAttributions])];
    return `${
      uniqueAttributions.length
        ? `${uniqueAttributions.map(attr => ATTRIBUTIONS[attr]).join(', ')}, `
        : ''
    }© <a href="https://www.mapbox.com/about/maps/" target="_blank" rel="noopener noreferrer">Mapbox</a>, © <a href="http://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>`;
  }
);

export const selectSerializedState = createSelector(
  [selectViewport, selectBasemap, selectBasemapParams, selectContextualLayers, selectLayers],
  (viewport, basemap, basemapParams, contextualLayers, layers) => {
    return {
      viewport: omit(viewport, 'transitionDuration', 'bounds'),
      basemap,
      basemapParams: omit(basemapParams, 'key'),
      contextualLayers,
      layers,
    };
  }
);

export default toolActions =>
  createSlice({
    name: SLICE_NAME,
    initialState: {
      viewport: {
        zoom: 2,
        latitude: 0,
        longitude: 0,
        transitionDuration: 250,
        bounds: null,
      },
      basemap: 'mongabay-paper',
      basemapParams: null,
      contextualLayers: [],
      layers: {},
    },
    reducers: {
      updateZoom(state, action) {
        state.viewport.zoom = action.payload;
      },
      updateCenter(state, action) {
        state.viewport.latitude = action.payload.latitude;
        state.viewport.longitude = action.payload.longitude;
      },
      updateBounds(state, action) {
        state.viewport.bounds = action.payload;
      },
      updateViewport(state, action) {
        const { transitionDuration } = state.viewport;
        state.viewport = action.payload;
        state.viewport.transitionDuration = transitionDuration;
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
    },
    extraReducers: {
      [toolActions.restoreState.fulfilled]: (state, action) => {
        const stateToRestore = action.payload[SLICE_NAME] || {};

        return {
          ...state,
          ...stateToRestore,
          viewport: {
            ...state.viewport,
            ...(stateToRestore.viewport ?? {}),
          },
          layers: {
            ...state.layers,
            ...(stateToRestore.layers ?? {}),
          },
          contextualLayers: [...state.contextualLayers, ...(stateToRestore.contextualLayers ?? [])],
        };
      },
    },
  });
