import { connect } from 'react-redux';

import { mapSelectors, mapActions, exportSelectors } from 'modules/tool';
import Component from './component';

export default connect(
  state => ({
    viewport: mapSelectors.selectViewport(state),
    legendDataLayers: mapSelectors.selectLegendDataLayers(state),
    width: exportSelectors.selectWidth(state),
    height: exportSelectors.selectHeight(state),
    exporting: exportSelectors.selectExporting(state),
    mode: exportSelectors.selectMode(state),
  }),
  {
    updateViewport: mapActions.updateViewport,
    updateBasemap: mapActions.updateBasemap,
    removeLayer: mapActions.removeLayer,
    updateLayer: mapActions.updateLayer,
    updateLayerOrder: mapActions.updateLayerOrder,
  }
)(Component);
