import { connect } from 'react-redux';

import { mapSelectors, mapActions } from 'modules/tool';
import Component from './component';

export default connect(
  state => ({
    activeLayers: mapSelectors.selectActiveDataLayers(state),
  }),
  {
    addLayer: mapActions.addLayer,
    removeLayer: mapActions.removeLayer,
  }
)(Component);
