import { connect } from 'react-redux';

import { mapSelectors, mapActions } from 'modules/tool';
import Component from './component';

export default connect(
  state => ({
    basemapParams: mapSelectors.selectBasemapParams(state),
  }),
  {
    updatebasemapParams: mapActions.updateBasemapParams,
  }
)(Component);
