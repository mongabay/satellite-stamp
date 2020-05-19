import { connect } from 'react-redux';

import { mapSelectors, mapActions } from 'modules/tool';
import Component from './component';

export default connect(
  state => ({
    basemap: mapSelectors.selectBasemap(state),
    basemapParams: mapSelectors.selectBasemapParams(state),
  }),
  {
    onChangeBasemap: mapActions.updateBasemap,
    onChangeBasemapParams: mapActions.updateBasemapParams,
  }
)(Component);
