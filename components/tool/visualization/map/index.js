import { connect } from 'react-redux';

import { mapSelectors } from 'modules/tool';
import Component from './component';

export default connect(state => ({
  basemap: mapSelectors.selectBasemap(state),
  contextualLayers: mapSelectors.selectContextualLayers(state),
}))(Component);
