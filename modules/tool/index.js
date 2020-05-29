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
      exportModule.selectMode,
      exportModule.selectModeParams,
    ],
    (layers, dataLayers, activeLayersDef, mode, modeParams) => {
      return modeParams.dates.map(date => {
        if (
          (mode === '2-vertical' || mode === '2-horizontal' || mode === '4') &&
          modeParams.difference === 'temporal' &&
          date
        ) {
          const diffLayer = modeParams.layer;
          return activeLayersDef.map(layer =>
            layer.id !== diffLayer
              ? layer
              : getLayerDef(layer.id, dataLayers[layer.id], {
                  ...layers[layer.id],
                  dateRange: [date, date],
                  currentDate: date,
                })
          );
        }

        return activeLayersDef;
      });
    }
  ),
  selectMapsTitle: createSelector(
    [mapModule.selectDataLayers, exportModule.selectMode, exportModule.selectModeParams],
    (dataLayers, mode, modeParams) => {
      return modeParams.dates.map(date => {
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
};

export const toolActions = actions;
export const toolSelectors = selectors;

export const mapReducer = mapSlice.reducer;
export const mapActions = mapSlice.actions;
export const mapSelectors = mapModule;

export const exportReducer = exportSlice.reducer;
export const exportActions = exportSlice.actions;
export const exportSelectors = exportModule;
