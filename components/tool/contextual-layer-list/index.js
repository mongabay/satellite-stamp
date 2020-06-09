import { connect } from 'react-redux';

import { mapSelectors, mapActions } from 'modules/tool';
import Component from './component';

export default connect(
  state => ({
    contextualLayers: mapSelectors.selectContextualLayers(state),
  }),
  {
    updateContextualLayers: mapActions.updateContextualLayers,
    addContextualLayer: mapActions.addContextualLayer,
    removeContextualLayer: mapActions.removeContextualLayer,
  }
)(Component);
