import { createSelector, createAction, createAsyncThunk } from '@reduxjs/toolkit';
import moment from 'moment';
import omit from 'lodash/omit';

import { deserialize, serialize } from 'utils/functions';
import { getLayerDef } from 'utils/map';
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
      exportModule.selectMode,
      exportModule.selectModeParams,
    ],
    (layers, dataLayers, activeLayersDef, recentImagery, mode, modeParams) => {
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
            res.splice(
              diffLayerIndex,
              1,
              getLayerDef(res[diffLayerIndex].id, dataLayers[res[diffLayerIndex].id], {
                ...layers[res[diffLayerIndex].id],
                dateRange: [date, date],
                currentDate: date,
              })
            );
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
          const layer = dataLayers[modeParams.layer];
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
};

export const toolActions = actions;
export const toolSelectors = selectors;

export const mapReducer = mapSlice.reducer;
export const mapActions = mapSlice.actions;
export const mapSelectors = mapModule;

export const exportReducer = exportSlice.reducer;
export const exportActions = exportSlice.actions;
export const exportSelectors = exportModule;
