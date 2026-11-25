import { connect } from 'react-redux';

import { mapSelectors, toolSelectors } from 'modules/tool';
import Component from './component';

export default connect(
  state => ({
    basemap: mapSelectors.selectBasemap(state),
    contextualLayers: mapSelectors.selectContextualLayers(state),
    transformRequest: toolSelectors.selectTransformRequest(state),
  }),
  null,
  null,
  { forwardRef: true }
)(Component);
