import { connect } from 'react-redux';

import { mapSelectors, mapActions } from 'modules/tool';
import Component from './component';

export default connect(
  state => ({
    showMap: mapSelectors.selectInsetMap(state),
  }),
  {
    toggleMap: mapActions.updateInsetMap,
  }
)(Component);
