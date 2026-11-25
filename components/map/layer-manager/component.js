import React from 'react';
import PropTypes from 'prop-types';

import { LayerManager as VizzLayerManager, Layer } from 'layer-manager/dist/components';
import { PluginMapboxGl } from 'layer-manager';

export { fetch } from 'layer-manager';

const LayerManager = ({ map, layers, providers }) => (
  <VizzLayerManager map={map} plugin={PluginMapboxGl} providers={providers}>
    {layers.map(({ reloadKey, ...l }) => {
      // Changing `reloadKey` removes the layer and adds it again (e.g. to fetch its tiles again)
      return <Layer key={reloadKey ?? l.id} {...l} />;
    })}
  </VizzLayerManager>
);

LayerManager.propTypes = {
  map: PropTypes.object.isRequired,
  layers: PropTypes.array.isRequired,
  providers: PropTypes.object.isRequired,
};

export default LayerManager;
