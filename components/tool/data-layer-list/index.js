import { connect } from 'react-redux';

import { mapSelectors, mapActions } from 'modules/tool';
import Component from './component';

export default connect(
  state => ({
    activeLayers: mapSelectors.selectActiveDataLayers(state),
    layers: mapSelectors.selectLayers(state),
  }),
  {
    addLayer: mapActions.addLayer,
    removeLayer: mapActions.removeLayer,
    updateLayer: mapActions.updateLayer,
  }
)(Component);
