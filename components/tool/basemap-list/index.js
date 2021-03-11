import { connect } from 'react-redux';

import { mapSelectors, mapActions, exportSelectors } from 'modules/tool';
import Component from './component';

export default connect(
  state => ({
    basemap: mapSelectors.selectBasemap(state),
    basemapParams: mapSelectors.selectBasemapParams(state),
    mode: exportSelectors.selectMode(state),
    modeParams: exportSelectors.selectModeParams(state),
  }),
  {
    onChangeBasemap: mapActions.updateBasemap,
    onChangeBasemapParams: mapActions.updateBasemapParams,
  }
)(Component);
