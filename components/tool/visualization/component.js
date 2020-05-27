import React, { useRef, useMemo, useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash/debounce';

import { toggleBasemap, toggleContextualLayers } from 'utils/map';
import {
  BASEMAPS,
  CONTEXTUAL_LAYERS,
  mapStyle,
  Map,
  LayerManager,
  Legend,
  getViewportFromBounds,
} from 'components/map';
import Attributions from '../attributions';

import './style.scss';

const Visualization = ({
  exporting,
  width,
  height,
  legendDataLayers,
  activeLayersDef,
  basemap,
  contextualLayers,
  viewport,
  updateLayer,
  removeLayer,
  updateLayerOrder,
  updateViewport,
}) => {
  const mapRef = useRef(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const map = useMemo(() => mapRef.current?.getMap(), [mapRef.current]);
  const [mapLoaded, setMapLoaded] = useState(false);

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

  const onLoadMap = useCallback(
    m => {
      setMapLoaded(true);
      toggleBasemap(m, BASEMAPS[basemap]);
    },
    [basemap]
  );

  // When the basemap or contextual layers change, we update the map style
  useEffect(() => {
    if (map && mapLoaded) {
      toggleBasemap(map, BASEMAPS[basemap]);
      toggleContextualLayers(
        map,
        contextualLayers.map(l => CONTEXTUAL_LAYERS[l])
      );
    }
  }, [map, mapLoaded, basemap, contextualLayers]);

  return (
    <div className="c-tool-visualization">
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
          <Map
            ref={mapRef}
            preserveDrawingBuffer // Needed for the export
            mapStyle={mapStyle}
            viewport={viewport}
            onViewportChange={onChangeViewport}
            onLoad={onLoadMap}
            onResize={({ width, height }) => {
              if (mapLoaded && viewport.bounds) {
                updateViewport(getViewportFromBounds(width, height, viewport, viewport.bounds));
              }
            }}
            {...(exporting
              ? {
                  width,
                  height: height - 26, // 26px is the height of the attributions
                }
              : {})}
          >
            {map => <LayerManager map={map} providers={{}} layers={activeLayersDef} />}
          </Map>
          <Attributions />
        </div>
      </div>
    </div>
  );
};

Visualization.propTypes = {
  viewport: PropTypes.object.isRequired,
  basemap: PropTypes.string.isRequired,
  contextualLayers: PropTypes.arrayOf(PropTypes.string).isRequired,
  activeLayersDef: PropTypes.arrayOf(PropTypes.object).isRequired,
  legendDataLayers: PropTypes.arrayOf(PropTypes.object).isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  exporting: PropTypes.bool.isRequired,
  updateViewport: PropTypes.func.isRequired,
  updateBasemap: PropTypes.func.isRequired,
  removeLayer: PropTypes.func.isRequired,
  updateLayer: PropTypes.func.isRequired,
  updateLayerOrder: PropTypes.func.isRequired,
};

export default Visualization;
