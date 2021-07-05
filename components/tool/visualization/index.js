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
    progress: exportSelectors.selectProgress(state),
    mode: exportSelectors.selectMode(state),
    modeParams: exportSelectors.selectModeParams(state),
    mapsShowScaleBar: toolSelectors.selectMapsShowScaleBar(state),
    showInsetMap: toolSelectors.selectShowInsetMap(state),
  }),
  {
    updateViewport: mapActions.updateViewport,
    updateViewports: mapActions.updateViewports,
    updateIdle: mapActions.updateIdle,
    updateBasemap: mapActions.updateBasemap,
    removeLayer: mapActions.removeLayer,
    updateLayer: mapActions.updateLayer,
    updateLayerOrder: mapActions.updateLayerOrder,
  }
)(Component);
