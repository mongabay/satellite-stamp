import { connect } from 'react-redux';

import { mapSelectors, mapActions, exportSelectors, toolSelectors } from 'modules/tool';
import Component from './component';

export default connect(
  state => ({
    viewports: mapSelectors.selectViewports(state),
    mapsActiveLayersDef: toolSelectors.selectMapsActiveLayersDef(state),
    activeDataLayersInteractiveIds: mapSelectors.selectActiveDataLayersInteractiveIds(state),
    mapsTitle: toolSelectors.selectMapsTitle(state),
    legendDataLayers: toolSelectors.selectLegendDataLayers(state),
    width: exportSelectors.selectWidth(state),
    height: exportSelectors.selectHeight(state),
    exporting: exportSelectors.selectExporting(state),
    mode: exportSelectors.selectMode(state),
    modeParams: exportSelectors.selectModeParams(state),
    mapsShowScaleBar: toolSelectors.selectMapsShowScaleBar(state),
  }),
  {
    updateViewport: mapActions.updateViewport,
    updateViewports: mapActions.updateViewports,
    updateBasemap: mapActions.updateBasemap,
    removeLayer: mapActions.removeLayer,
    updateLayer: mapActions.updateLayer,
    updateLayerOrder: mapActions.updateLayerOrder,
  }
)(Component);
