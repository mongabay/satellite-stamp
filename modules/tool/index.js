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
      if (mode === '1' && recentImagery?.tileUrl) {
        return modeParams.dates[0].map(() => [
          ...activeLayersDef,
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
          ),
        ]);
      }

      if (
        (mode === '2-vertical' || mode === '2-horizontal' || mode === '4') &&
        modeParams.difference === 'temporal'
      ) {
        return modeParams.dates[0].map((_, mapIndex) => {
          let res = [...activeLayersDef];

          modeParams.layers.forEach((diffLayer, layerIndex) => {
            const layerDate = modeParams.dates[layerIndex][mapIndex];
            if (layerDate) {
              const diffLayerIndex = res.findIndex(layer => layer.id === diffLayer);
              if (diffLayerIndex !== -1) {
                const isLayerDataLayer = !!DATA_LAYERS[diffLayer];
                const isLayerBasemap = !!BASEMAPS[diffLayer];

                let layerDef = res[diffLayerIndex];
                if (isLayerDataLayer) {
                  layerDef = getLayerDef(
                    res[diffLayerIndex].id,
                    dataLayers[res[diffLayerIndex].id],
                    {
                      ...layers[res[diffLayerIndex].id],
                      dateRange: [layerDate, layerDate],
                      currentDate: layerDate,
                    }
                  );
                } else if (isLayerBasemap) {
                  layerDef = getBasemapDef(
                    res[diffLayerIndex].id,
                    BASEMAPS[res[diffLayerIndex].id],
                    {
                      ...basemapParams,
                      // TODO: other basemap may use other attributes for the date
                      year: moment(layerDate).format(
                        BASEMAPS[res[diffLayerIndex].id].legend.timeline.dateFormat
                      ),
                    }
                  );
                }

                res.splice(diffLayerIndex, 1, layerDef);
              }
            }
          });

          return res;
        });
      }

      return modeParams.dates[0].map(() => [...activeLayersDef]);
    }
  ),
  selectMapsTitle: createSelector(
    [
      mapModule.selectDataLayers,
      mapModule.selectLayers,
      mapModule.selectBasemapParams,
      mapModule.selectRecentImagery,
      exportModule.selectMode,
      exportModule.selectModeParams,
      exportModule.selectExporting,
    ],
    (dataLayers, layers, basemapParams, recentImagery, mode, modeParams, exporting) => {
      return modeParams.dates[0].map((date, index) => {
        if (mode === '1' && recentImagery?.tileInfo) {
          return [`${recentImagery.tileInfo.date} - ${recentImagery.tileInfo.satellite}`];
        }

        if (
          (mode === '2-vertical' || mode === '2-horizontal' || mode === '4') &&
          modeParams.difference === 'temporal' &&
          modeParams.layers.length > 0
        ) {
          return modeParams.layers
            .filter((layer, layerIndex) => !!modeParams.dates[layerIndex][index])
            .map((layer, layerIndex) => {
              const date = modeParams.dates[layerIndex][index];
              const layerConfig = dataLayers[layer] ?? BASEMAPS[layer];
              const format = layerConfig.legend.timeline.dateFormat;
              if (modeParams.layers.length === 1) {
                return moment(date).format(format);
              }

              return `${moment(date).format(format)} - ${layerConfig.label}`;
            });
        }

        if (mode === 'animated' && exporting) {
          const layer = modeParams.layers[0];
          const date = dataLayers[layer]
            ? layers[layer].currentDate
            : // TODO: don't assume the date parameter is the basemap's first param
              basemapParams[Object.keys(BASEMAPS[layer].params)[0]];
          const layerConfig = dataLayers[layer] ?? BASEMAPS[layer];
          const format = layerConfig.legend.timeline.dateFormat;
          return [moment(date).format(format)];
        }

        return null;
      });
    }
  ),
  selectLegendDataLayers: createSelector(
    [mapModule.selectLegendDataLayers, exportModule.selectMode, exportModule.selectModeParams],
    (legendDataLayers, mode, modeParams) => {
      const isTemporalMode =
        (mode === '2-vertical' || mode === '2-horizontal' || mode === '4') &&
        modeParams.difference === 'temporal' &&
        modeParams.layers.length > 0;

      const isAnimatedMode = mode === 'animated' && modeParams.layers.length > 0;

      if (isTemporalMode || isAnimatedMode) {
        return legendDataLayers.map(layerGroup => {
          if (modeParams.layers.indexOf(layerGroup.id) === -1) {
            return layerGroup;
          }

          return {
            ...layerGroup,
            layers: [
              {
                ...omit(layerGroup.layers[0], 'timelineParams'),
                legendConfig: {
                  ...omit(layerGroup.layers[0].legendConfig, 'timeline'),
                },
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
      if (mode === '1' || mode === 'animated') {
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
      return (mode === '1' || mode === 'animated') && showInsetMap;
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
        modeParams.layers.indexOf(basemap) !== -1;

      const isBasemapUsedInAnimation =
        mode === 'animated' && modeParams.layers.indexOf(basemap) !== -1;

      let basemapNotes;
      if (basemapParams && !isBasemapUsedInTemporalDifference && !isBasemapUsedInAnimation) {
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
  selectAnimatedLayerStartDates: createSelector(
    [mapModule.selectExportTemporalDiffLayers, exportModule.selectModeParams],
    (temporalDiffLayers, modeParams) => {
      if (!modeParams.layers.length || !temporalDiffLayers[modeParams.layers[0]]) {
        return [];
      }

      if (modeParams.dates[0].length < 2) {
        return temporalDiffLayers[modeParams.layers[0]];
      }

      return temporalDiffLayers[modeParams.layers[0]].filter(option =>
        moment(option.value).isBefore(moment(modeParams.dates[0][1]))
      );
    }
  ),
  selectAnimatedLayerEndDates: createSelector(
    [mapModule.selectExportTemporalDiffLayers, exportModule.selectModeParams],
    (temporalDiffLayers, modeParams) => {
      if (!modeParams.layers.length || !temporalDiffLayers[modeParams.layers[0]]) {
        return [];
      }

      if (modeParams.dates[0].length < 1 || !modeParams.dates[0][0]) {
        return temporalDiffLayers[modeParams.layers[0]];
      }

      return temporalDiffLayers[modeParams.layers[0]].filter(option =>
        moment(option.value).isAfter(moment(modeParams.dates[0][0]))
      );
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
