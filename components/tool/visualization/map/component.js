import React, { useRef, useMemo, useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';

import { toggleBasemap, toggleContextualLayers } from 'utils/map';
import { BASEMAPS, CONTEXTUAL_LAYERS, mapStyle, Map, LayerManager } from 'components/map';

const VisualizationMap = ({ layers, basemap, contextualLayers, onChangeViewport, ...rest }) => {
  const mapRef = useRef(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const map = useMemo(() => mapRef.current?.getMap(), [mapRef.current]);
  const [mapLoaded, setMapLoaded] = useState(false);

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
    <Map
      ref={mapRef}
      preserveDrawingBuffer // Needed for the export
      mapStyle={mapStyle}
      onViewportChange={onChangeViewport}
      onLoad={onLoadMap}
      {...rest}
    >
      {map => <LayerManager map={map} providers={{}} layers={layers} />}
    </Map>
  );
};

VisualizationMap.propTypes = {
  basemap: PropTypes.string.isRequired,
  contextualLayers: PropTypes.arrayOf(PropTypes.string).isRequired,
  layers: PropTypes.arrayOf(PropTypes.object).isRequired,
  onChangeViewport: PropTypes.func.isRequired,
};

export default VisualizationMap;
