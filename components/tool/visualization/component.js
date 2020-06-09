import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash/debounce';
import classnames from 'classnames';

import { DATA_LAYERS, getViewportFromBounds, Legend, ScaleControl } from 'components/map';
import Map from './map';
import InteractiveFeaturePopup from './interactive-feature-popup';
import Attributions from '../attributions';
import { shouldDisplayScaleBar } from './helpers';

import './style.scss';

const Visualization = ({
  exporting,
  width,
  height,
  mapsActiveLayersDef,
  activeDataLayersInteractiveIds,
  mapsTitle,
  legendDataLayers,
  viewports,
  mode,
  modeParams,
  updateLayer,
  removeLayer,
  updateLayerOrder,
  updateViewport,
  updateViewports,
}) => {
  const [interactiveFeature, setInteractiveFeature] = useState(null);

  /**
   * @type {(mapIndex: any, mapViewport: any) => void}
   */
  const onChangeViewport = useCallback(
    debounce((index, difference, mapViewport) => {
      const viewport = {
        zoom: mapViewport.zoom,
        latitude: mapViewport.latitude,
        longitude: mapViewport.longitude,
        bounds: mapViewport.bounds,
      };

      // If the user is using a temporal difference, all the maps should have the same position
      if (difference === 'temporal' && index === 0) {
        updateViewports(viewport);
      } else {
        updateViewport({
          index,
          viewport,
        });
      }
    }, 500),
    [updateViewport]
  );

  const onClick = useCallback(
    ({ lngLat, features }) => {
      if (features.length) {
        const feature = features[0];
        const layerId = feature.layer.source;
        const propertiesFormatter = DATA_LAYERS[layerId]?.config.interactiveFeatureFormat;

        setInteractiveFeature({
          lat: lngLat[1],
          lng: lngLat[0],
          properties: propertiesFormatter
            ? propertiesFormatter(feature.properties)
            : feature.properties,
        });
      } else {
        setInteractiveFeature(null);
      }
    },
    [setInteractiveFeature]
  );

  useEffect(() => {
    if (exporting) {
      setInteractiveFeature(null);
    }
  }, [exporting, setInteractiveFeature]);

  return (
    <div
      className={classnames([
        'c-tool-visualization',
        `mode-${mode}`,
        `${exporting ? 'exporting' : ''}`,
      ])}
    >
      {exporting && <div className="exporting-message">Exporting...</div>}
      <div
        className="container-width js-visualization"
        // We need both width and min-width:
        // - width so that maps smaller than the parent are correctly sized
        // - min-width so that maps bigger than the parent overflow correctly
        style={exporting ? { width: `${width}px`, minWidth: `${width}px` } : undefined}
      >
        <div className="container-ratio" style={exporting ? { height: `${height}px` } : undefined}>
          <Legend
            exporting={exporting}
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
            className="map-container"
            style={
              exporting
                ? {
                    width,
                    height: height - 26, // 26px is the height of the attributions
                  }
                : undefined
            }
          >
            {viewports.map((viewport, index) => (
              <div key={index} className="map">
                {mapsTitle[index] && <div className="title">{mapsTitle[index]}</div>}
                <Map
                  layers={mapsActiveLayersDef[index]}
                  viewport={viewports[index]}
                  interactiveLayerIds={activeDataLayersInteractiveIds}
                  onClick={onClick}
                  onChangeViewport={
                    // We remove the callback to indicate the map should be static
                    index === 0 || modeParams.difference === 'spatial'
                      ? v => onChangeViewport(index, modeParams.difference, v)
                      : undefined
                  }
                  onResize={({ width, height }) => {
                    if (viewports[index].bounds) {
                      updateViewport({
                        index,
                        viewport: getViewportFromBounds(
                          width,
                          height,
                          viewports[index],
                          viewports[index].bounds
                        ),
                      });
                    }
                  }}
                >
                  <>
                    {interactiveFeature && (
                      <InteractiveFeaturePopup
                        {...interactiveFeature}
                        onClose={() => setInteractiveFeature(null)}
                      />
                    )}
                    {shouldDisplayScaleBar(index, mode, modeParams.difference) && (
                      <div className="scale-control">
                        <ScaleControl />
                      </div>
                    )}
                  </>
                </Map>
              </div>
            ))}
          </div>
          <Attributions exporting={exporting} />
        </div>
      </div>
    </div>
  );
};

Visualization.propTypes = {
  viewports: PropTypes.arrayOf(PropTypes.object).isRequired,
  mapsActiveLayersDef: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.object)).isRequired,
  activeDataLayersInteractiveIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  mapsTitle: PropTypes.arrayOf(PropTypes.string).isRequired,
  legendDataLayers: PropTypes.arrayOf(PropTypes.object).isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  exporting: PropTypes.bool.isRequired,
  mode: PropTypes.string.isRequired,
  modeParams: PropTypes.object.isRequired,
  updateViewport: PropTypes.func.isRequired,
  updateViewports: PropTypes.func.isRequired,
  updateBasemap: PropTypes.func.isRequired,
  removeLayer: PropTypes.func.isRequired,
  updateLayer: PropTypes.func.isRequired,
  updateLayerOrder: PropTypes.func.isRequired,
};

export default Visualization;
