import { connect } from 'react-redux';

import { toolSelectors, toolActions } from 'modules/tool';
import Component from './component';

export default connect(
  state => ({
    serializedState: toolSelectors.selectSerializedState(state),
    restoring: toolSelectors.selectRestoring(state),
  }),
  {
    restoreState: toolActions.restoreState,
  }
)(Component);
