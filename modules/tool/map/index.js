import { createSlice, createSelector } from '@reduxjs/toolkit';
import omit from 'lodash/omit';

import { BASEMAPS } from 'components/map';

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

export const selectBasemapLayerDef = createSelector(
  [selectBasemap, selectBasemapParams],
  (basemap, basemapParams) => {
    let basemapUrl = BASEMAPS[basemap].url;

    if (!basemapUrl) {
      return null;
    }

    if (basemapParams) {
      basemapUrl = Object.keys(basemapParams).reduce(
        (res, key) => basemapUrl.replace(`{${key}}`, basemapParams[key]),
        basemapUrl
      );
    }

    return {
      id: basemap,
      type: 'raster',
      source: {
        type: 'raster',
        tiles: [basemapUrl],
        minzoom: BASEMAPS[basemap].minZoom,
        maxzoom: BASEMAPS[basemap].maxZoom,
      },
    };
  }
);

export const selectActiveLayersDef = createSelector([selectBasemapLayerDef], basemapLayerDef => [
  ...(basemapLayerDef ? [basemapLayerDef] : []),
]);

export const selectSerializedState = createSelector(
  [selectViewport, selectBasemap, selectBasemapParams, selectContextualLayers],
  (viewport, basemap, basemapParams, contextualLayers) => {
    return {
      viewport: omit(viewport, 'transitionDuration', 'bounds'),
      basemap,
      basemapParams,
      contextualLayers,
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
      // updateLayerOrder(state, action) {
      //   const mapLayerToOrder = action.payload
      //     // We remove the IDs that correspond to the boundaries
      //     .filter(layerId => !!LAYERS[layerId])
      //     .reduce((res, layerId, index) => ({ ...res, [layerId]: index }), {});

      //   Object.keys(state.layers).forEach(layerId => {
      //     state.layers[layerId].order = mapLayerToOrder[layerId];
      //   });
      // },
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
