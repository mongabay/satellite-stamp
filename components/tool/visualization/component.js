import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash/debounce';
import classnames from 'classnames';

import { getViewportFromBounds, Legend } from 'components/map';
import Map from './map';
import Attributions from '../attributions';

import './style.scss';

const Visualization = ({
  exporting,
  width,
  height,
  activeLayersDef,
  map1ActiveLayersDef,
  map2ActiveLayersDef,
  legendDataLayers,
  viewport,
  mode,
  modeParams,
  updateLayer,
  removeLayer,
  updateLayerOrder,
  updateViewport,
  updateModeParams,
}) => {
  const onChangeViewport = useCallback(
    // @ts-ignore
    debounce(v => {
      updateViewport({
        zoom: v.zoom,
        latitude: v.latitude,
        longitude: v.longitude,
        bounds: v.bounds,
      });
    }, 500),
    [updateViewport]
  );

  const onChangeModeParamsViewport = useCallback(
    // @ts-ignore
    debounce(v => {
      updateModeParams({
        ...modeParams,
        viewport: {
          zoom: v.zoom,
          latitude: v.latitude,
          longitude: v.longitude,
          bounds: v.bounds,
        },
      });
    }, 500),
    [modeParams, updateModeParams]
  );

  return (
    <div className="c-tool-visualization">
      {exporting && <div className="exporting-message">Exporting...</div>}
      <div
        className="container-width js-visualization"
        style={exporting ? { width: `${width}px` } : undefined}
      >
        <div className="container-ratio" style={exporting ? { height: `${height}px` } : undefined}>
          <Legend
            layers={legendDataLayers}
            onChangeOpacity={(id, opacity) => updateLayer({ id, opacity })}
            onClickToggleVisibility={(id, visible) => updateLayer({ id, visible })}
            onClickRemove={removeLayer}
            onChangeDate={(id, dates) =>
              updateLayer({ id, dateRange: [dates[0], dates[2]], currentDate: dates[1] })
            }
            onChangeLayersOrder={updateLayerOrder}
          />
          <div
            className={classnames(['map-container', `mode-${mode}`])}
            style={
              exporting
                ? {
                    width,
                    height: height - 26, // 26px is the height of the attributions
                  }
                : undefined
            }
          >
            <Map
              layers={
                mode === '2-vertical' || mode === '2-horizontal'
                  ? map1ActiveLayersDef
                  : activeLayersDef
              }
              viewport={viewport}
              onChangeViewport={onChangeViewport}
              onResize={({ width, height }) => {
                if (viewport.bounds) {
                  updateViewport(getViewportFromBounds(width, height, viewport, viewport.bounds));
                }
              }}
            />
            {(mode === '2-vertical' || mode === '2-horizontal') && (
              <Map
                // Needed so we correctly determine if the map has loaded
                key={modeParams.difference}
                isStatic={modeParams.difference !== 'spatial'}
                layers={map2ActiveLayersDef}
                viewport={modeParams.difference === 'spatial' ? modeParams.viewport : viewport}
                onChangeViewport={
                  modeParams.difference === 'spatial' ? onChangeModeParamsViewport : () => null
                }
                onResize={
                  modeParams.difference === 'spatial'
                    ? ({ width, height }) => {
                        if (modeParams.viewport?.bounds) {
                          updateModeParams({
                            ...modeParams,
                            viewport: getViewportFromBounds(
                              width,
                              height,
                              modeParams.viewport,
                              modeParams.viewport.bounds
                            ),
                          });
                        }
                      }
                    : undefined
                }
              />
            )}
          </div>
          <Attributions />
        </div>
      </div>
    </div>
  );
};

Visualization.propTypes = {
  viewport: PropTypes.object.isRequired,
  activeLayersDef: PropTypes.arrayOf(PropTypes.object).isRequired,
  map1ActiveLayersDef: PropTypes.arrayOf(PropTypes.object).isRequired,
  map2ActiveLayersDef: PropTypes.arrayOf(PropTypes.object).isRequired,
  legendDataLayers: PropTypes.arrayOf(PropTypes.object).isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  exporting: PropTypes.bool.isRequired,
  mode: PropTypes.string.isRequired,
  modeParams: PropTypes.object.isRequired,
  updateViewport: PropTypes.func.isRequired,
  updateBasemap: PropTypes.func.isRequired,
  removeLayer: PropTypes.func.isRequired,
  updateLayer: PropTypes.func.isRequired,
  updateLayerOrder: PropTypes.func.isRequired,
  updateModeParams: PropTypes.func.isRequired,
};

export default Visualization;
