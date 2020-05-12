import { connect } from 'react-redux';

import { toolSelectors, mapSelectors, toolActions, mapActions } from 'modules/tool';
import Component from './component';

export default connect(
  state => ({
    zoom: mapSelectors.selectZoom(state),
    viewport: mapSelectors.selectViewport(state),
    basemap: mapSelectors.selectBasemap(state),
    basemapParams: mapSelectors.selectBasemapParams(state),
    contextualLayers: mapSelectors.selectContextualLayers(state),
    activeLayersDef: mapSelectors.selectActiveLayersDef(state),
    serializedState: toolSelectors.selectSerializedState(state),
  }),
  {
    restoreState: toolActions.restoreState,
    updateZoom: mapActions.updateZoom,
    updateViewport: mapActions.updateViewport,
    updateBasemap: mapActions.updateBasemap,
    updateBasemapParams: mapActions.updateBasemapParams,
  }
)(Component);
