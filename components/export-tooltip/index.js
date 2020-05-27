import { connect } from 'react-redux';

import { exportSelectors, exportActions } from 'modules/tool';
import Component from './component';

export default connect(
  state => ({
    width: exportSelectors.selectWidth(state),
    height: exportSelectors.selectHeight(state),
    mode: exportSelectors.selectMode(state),
  }),
  {
    updateSettings: exportActions.updateSettings,
    updateExporting: exportActions.updateExporting,
    updateMode: exportActions.updateMode,
  }
)(Component);
