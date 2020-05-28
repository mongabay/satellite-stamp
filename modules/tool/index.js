import { createSelector, createAsyncThunk } from '@reduxjs/toolkit';
import moment from 'moment';

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
  selectMap1ActiveLayersDef: createSelector(
    [
      mapModule.selectLayers,
      mapModule.selectDataLayers,
      mapModule.selectActiveLayersDef,
      exportModule.selectMode,
      exportModule.selectModeParams,
    ],
    (layers, dataLayers, activeLayersDef, mode, modeParams) => {
      if (
        (mode === '2-vertical' || mode === '2-horizontal') &&
        modeParams.difference === 'temporal' &&
        modeParams.map1Date
      ) {
        const diffLayer = modeParams.layer;
        return activeLayersDef.map(layer =>
          layer.id !== diffLayer
            ? layer
            : getLayerDef(layer.id, dataLayers[layer.id], {
                ...layers[layer.id],
                dateRange: [modeParams.map1Date, modeParams.map1Date],
                currentDate: modeParams.map1Date,
              })
        );
      }

      return activeLayersDef;
    }
  ),
  selectMap2ActiveLayersDef: createSelector(
    [
      mapModule.selectLayers,
      mapModule.selectDataLayers,
      mapModule.selectActiveLayersDef,
      exportModule.selectMode,
      exportModule.selectModeParams,
    ],
    (layers, dataLayers, activeLayersDef, mode, modeParams) => {
      if (
        (mode === '2-vertical' || mode === '2-horizontal') &&
        modeParams.difference === 'temporal' &&
        modeParams.map2Date
      ) {
        const diffLayer = modeParams.layer;
        return activeLayersDef.map(layer =>
          layer.id !== diffLayer
            ? layer
            : getLayerDef(layer.id, dataLayers[layer.id], {
                ...layers[layer.id],
                dateRange: [modeParams.map2Date, modeParams.map2Date],
                currentDate: modeParams.map2Date,
              })
        );
      }

      return activeLayersDef;
    }
  ),
  selectMap1Title: createSelector(
    [mapModule.selectDataLayers, exportModule.selectMode, exportModule.selectModeParams],
    (dataLayers, mode, modeParams) => {
      if (
        (mode === '2-vertical' || mode === '2-horizontal') &&
        modeParams.difference === 'temporal' &&
        modeParams.layer &&
        modeParams.map1Date
      ) {
        const layer = dataLayers[modeParams.layer];
        const format = layer.legend.timeline.dateFormat;
        return moment(modeParams.map1Date).format(format);
      }

      return null;
    }
  ),
  selectMap2Title: createSelector(
    [mapModule.selectDataLayers, exportModule.selectMode, exportModule.selectModeParams],
    (dataLayers, mode, modeParams) => {
      if (
        (mode === '2-vertical' || mode === '2-horizontal') &&
        modeParams.difference === 'temporal' &&
        modeParams.layer &&
        modeParams.map2Date
      ) {
        const layer = dataLayers[modeParams.layer];
        const format = layer.legend.timeline.dateFormat;
        return moment(modeParams.map2Date).format(format);
      }

      return null;
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
