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
  legendDataLayers,
  viewport,
  mode,
  updateLayer,
  removeLayer,
  updateLayerOrder,
  updateViewport,
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
              onChangeViewport={onChangeViewport}
              onResize={({ width, height }) => {
                if (viewport.bounds) {
                  updateViewport(getViewportFromBounds(width, height, viewport, viewport.bounds));
                }
              }}
            />
            {(mode === '2-vertical' || mode === '2-horizontal') && (
              <Map isStatic onViewportChange={() => null} />
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
  legendDataLayers: PropTypes.arrayOf(PropTypes.object).isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  exporting: PropTypes.bool.isRequired,
  mode: PropTypes.string.isRequired,
  updateViewport: PropTypes.func.isRequired,
  updateBasemap: PropTypes.func.isRequired,
  removeLayer: PropTypes.func.isRequired,
  updateLayer: PropTypes.func.isRequired,
  updateLayerOrder: PropTypes.func.isRequired,
};

export default Visualization;
