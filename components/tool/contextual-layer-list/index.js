import { connect } from 'react-redux';

import { mapSelectors, mapActions } from 'modules/tool';
import Component from './component';

export default connect(
  state => ({
    contextualLayers: mapSelectors.selectContextualLayers(state),
  }),
  {
    onAddContextualLayer: mapActions.addContextualLayer,
    onRemoveContextualLayer: mapActions.removeContextualLayer,
  }
)(Component);
