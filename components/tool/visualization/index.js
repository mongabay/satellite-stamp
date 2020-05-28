import { connect } from 'react-redux';

import {
  mapSelectors,
  mapActions,
  exportSelectors,
  exportActions,
  toolSelectors,
} from 'modules/tool';
import Component from './component';

export default connect(
  state => ({
    viewport: mapSelectors.selectViewport(state),
    activeLayersDef: mapSelectors.selectActiveLayersDef(state),
    map1ActiveLayersDef: toolSelectors.selectMap1ActiveLayersDef(state),
    map2ActiveLayersDef: toolSelectors.selectMap2ActiveLayersDef(state),
    legendDataLayers: mapSelectors.selectLegendDataLayers(state),
    width: exportSelectors.selectWidth(state),
    height: exportSelectors.selectHeight(state),
    exporting: exportSelectors.selectExporting(state),
    mode: exportSelectors.selectMode(state),
    modeParams: exportSelectors.selectModeParams(state),
  }),
  {
    updateViewport: mapActions.updateViewport,
    updateBasemap: mapActions.updateBasemap,
    removeLayer: mapActions.removeLayer,
    updateLayer: mapActions.updateLayer,
    updateLayerOrder: mapActions.updateLayerOrder,
    updateModeParams: exportActions.updateModeParams,
  }
)(Component);
