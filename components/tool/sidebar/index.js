import { connect } from 'react-redux';

import { mapSelectors, mapActions, exportSelectors } from 'modules/tool';
import Component from './component';

export default connect(
  state => ({
    activeLayers: mapSelectors.selectActiveDataLayers(state),
    exporting: exportSelectors.selectExporting(state),
  }),
  {
    addLayer: mapActions.addLayer,
    removeLayer: mapActions.removeLayer,
  }
)(Component);
