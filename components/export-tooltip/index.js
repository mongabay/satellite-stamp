import { connect } from 'react-redux';

import { exportSelectors, exportActions } from 'modules/tool';
import Component from './component';

export default connect(
  state => ({
    width: exportSelectors.selectWidth(state),
    height: exportSelectors.selectHeight(state),
  }),
  {
    updateSettings: exportActions.updateSettings,
    updateExporting: exportActions.updateExporting,
  }
)(Component);
