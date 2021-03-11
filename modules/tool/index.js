import { createSelector, createAction, createAsyncThunk } from '@reduxjs/toolkit';
import moment from 'moment';
import omit from 'lodash/omit';

import { deserialize, serialize } from 'utils/functions';
import { getBasemapDef, getLayerDef } from 'utils/map';
import { BASEMAPS, ATTRIBUTIONS, DATA_LAYERS } from 'components/map';
import { selectQuery } from '../routing';
import createMapSlice, * as mapModule from './map';
import createExportSlice, * as exportModule from './export';

// Common actions for the tool module
const actions = {
  restoreState: createAsyncThunk('tool/restoreState', (_, { getState }) => {
    const state = getState();
    const query = selectQuery(state);
    return deserialize(query.state);
  }),
  updateMode: createAction('tool/updateMode'),
  updateMapDifference: createAction('tool/updateMapDifference'),
};

// Slices belonging to the tool module
const mapSlice = createMapSlice(actions);
const exportSlice = createExportSlice(actions);

// Common selectors for the tool module
const selectors = {
  selectSerializedState: createSelector(
    [mapModule.selectSerializedState, exportModule.selectSerializedState],
    (mapState, exportState) =>
      serialize({
        [mapModule.SLICE_NAME]: mapState,
        [exportModule.SLICE_NAME]: exportState,
      })
  ),
  selectMapsActiveLayersDef: createSelector(
    [
      mapModule.selectLayers,
      mapModule.selectDataLayers,
      mapModule.selectActiveLayersDef,
      mapModule.selectRecentImagery,
      mapModule.selectBasemapParams,
      exportModule.selectMode,
      exportModule.selectModeParams,
    ],
    (layers, dataLayers, activeLayersDef, recentImagery, basemapParams, mode, modeParams) => {
      return modeParams.dates.map(date => {
        let res = [...activeLayersDef];

        if (mode === '1' && recentImagery?.tileUrl) {
          res.push(
            getLayerDef(
              'recent-imagery',
              {
                label: 'Recent satellite imagery',
                config: {
                  type: 'raster',
                  source: {
                    tiles: [recentImagery.tileUrl],
                    minzoom: 9,
                    maxzoom: 18,
                  },
                },
              },
              {
                opacity: 1,
                visibility: true,
                // The z-index must be 2 to be on top of the external basemaps which have a z-index
                // equal to 1
                // The getLayerDef function takes the order prop and adds 3 so all the data layers
                // are on top of th external basemaps and the recent imagery layer
                order: -1,
              }
            )
          );
        }

        if (
          (mode === '2-vertical' || mode === '2-horizontal' || mode === '4') &&
          modeParams.difference === 'temporal' &&
          date
        ) {
          const diffLayer = modeParams.layer;
          const diffLayerIndex = res.findIndex(layer => layer.id === diffLayer);
          if (diffLayerIndex !== -1) {
            const isLayerDataLayer = !!DATA_LAYERS[diffLayer];
            const isLayerBasemap = !!BASEMAPS[diffLayer];

            let layerDef = res[diffLayerIndex];
            if (isLayerDataLayer) {
              layerDef = getLayerDef(res[diffLayerIndex].id, dataLayers[res[diffLayerIndex].id], {
                ...layers[res[diffLayerIndex].id],
                dateRange: [date, date],
                currentDate: date,
              });
            } else if (isLayerBasemap) {
              layerDef = getBasemapDef(res[diffLayerIndex].id, BASEMAPS[res[diffLayerIndex].id], {
                ...basemapParams,
                // TODO: other basemap may use other attributes for the date
                year: moment(date).format(
                  BASEMAPS[res[diffLayerIndex].id].legend.timeline.dateFormat
                ),
              });
            }

            res.splice(diffLayerIndex, 1, layerDef);
          }
        }

        return res;
      });
    }
  ),
  selectMapsTitle: createSelector(
    [
      mapModule.selectDataLayers,
      mapModule.selectRecentImagery,
      exportModule.selectMode,
      exportModule.selectModeParams,
    ],
    (dataLayers, recentImagery, mode, modeParams) => {
      return modeParams.dates.map(date => {
        if (mode === '1' && recentImagery?.tileInfo) {
          return `${recentImagery.tileInfo.date} - ${recentImagery.tileInfo.satellite}`;
        }

        if (
          (mode === '2-vertical' || mode === '2-horizontal' || mode === '4') &&
          modeParams.difference === 'temporal' &&
          modeParams.layer &&
          date
        ) {
          const layer = dataLayers[modeParams.layer] ?? BASEMAPS[modeParams.layer];
          const format = layer.legend.timeline.dateFormat;
          return moment(date).format(format);
        }

        return null;
      });
    }
  ),
  selectLegendDataLayers: createSelector(
    [mapModule.selectLegendDataLayers, exportModule.selectMode, exportModule.selectModeParams],
    (legendDataLayers, mode, modeParams) => {
      if (
        (mode === '2-vertical' || mode === '2-horizontal' || mode === '4') &&
        modeParams.difference === 'temporal' &&
        modeParams.layer
      ) {
        const diffLayer = modeParams.layer;
        return legendDataLayers.map(layerGroup => {
          if (layerGroup.id !== diffLayer) {
            return layerGroup;
          }

          return {
            ...layerGroup,
            layers: [
              {
                ...omit(layerGroup.layers[0], 'timelineParams'),
              },
            ],
          };
        });
      }

      return legendDataLayers;
    }
  ),
  selectMapsShowScaleBar: createSelector(
    [exportModule.selectMode, exportModule.selectModeParams],
    (mode, modeParams) => {
      if (mode === '1') {
        return [true];
      }

      if (mode === '2-horizontal') {
        if (modeParams.difference === 'spatial') {
          return [true, true];
        }

        return [false, true];
      }

      if (mode === '2-vertical') {
        if (modeParams.difference === 'spatial') {
          return [true, true];
        }

        return [true, false];
      }

      if (mode === '4') {
        if (modeParams.difference === 'spatial') {
          return [true, true, true, true];
        }

        return [false, false, true, false];
      }

      return [true];
    }
  ),
  selectShowInsetMap: createSelector(
    [mapModule.selectInsetMap, exportModule.selectMode],
    (showInsetMap, mode) => {
      return mode === '1' && showInsetMap;
    }
  ),
  selectRestoring: createSelector([mapModule.selectRestoring], mapRestoring => mapRestoring),
  selectAttributions: createSelector(
    [
      mapModule.selectBasemap,
      mapModule.selectBasemapParams,
      mapModule.selectDataLayers,
      mapModule.selectActiveDataLayers,
      mapModule.selectRecentImagery,
      exportModule.selectMode,
      exportModule.selectModeParams,
    ],
    (basemap, basemapParams, dataLayers, activeDataLayers, recentImagery, mode, modeParams) => {
      const basemapAttributions = BASEMAPS[basemap].attributions
        ? BASEMAPS[basemap].attributions
        : [];

      const layerAttributions = activeDataLayers
        .map(layerId => dataLayers[layerId].attributions || [])
        .reduce((res, attr) => [...res, ...attr], []);

      // TODO: we shouldn't display the attributions when more than one map is shown at once because
      // the layer is not displayed on the map
      const recentImageryAttributions = recentImagery?.tileUrl ? ['rw'] : [];

      const uniqueAttributions = [
        ...new Set([...basemapAttributions, ...layerAttributions, ...recentImageryAttributions]),
      ];

      const isBasemapUsedInTemporalDifference =
        (mode === '2-vertical' || mode === '2-horizontal' || mode === '4') &&
        modeParams.difference === 'temporal' &&
        modeParams.layer &&
        basemap === modeParams.layer;

      let basemapNotes;
      if (basemapParams && !isBasemapUsedInTemporalDifference) {
        const allParamsSet = Object.values(basemapParams).every(
          param => param !== undefined && param !== null && param !== ''
        );

        if (allParamsSet) {
          if (basemapParams.period !== undefined && basemapParams.year !== undefined) {
            basemapNotes = `Basemap images from ${basemapParams.period} ${basemapParams.year}`;
          } else if (basemapParams.year !== undefined) {
            basemapNotes = `Basemap images from ${basemapParams.year}`;
          }
        }
      }

      return `${basemapNotes ? `${basemapNotes}, ` : ''}${
        uniqueAttributions.length
          ? `${uniqueAttributions.map(attr => ATTRIBUTIONS[attr]).join(', ')}, `
          : ''
      }© <a href="https://www.mapbox.com/about/maps/" target="_blank" rel="noopener noreferrer">Mapbox</a>, © <a href="http://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>`;
    }
  ),
};

export const toolActions = actions;
export const toolSelectors = selectors;

export const mapReducer = mapSlice.reducer;
export const mapActions = mapSlice.actions;
export const mapSelectors = mapModule;

export const exportReducer = exportSlice.reducer;
export const exportActions = exportSlice.actions;
export const exportSelectors = exportModule;
