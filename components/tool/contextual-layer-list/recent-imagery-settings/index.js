import { connect } from 'react-redux';

import { mapSelectors, mapActions } from 'modules/tool';
import Component from './component';

export default connect(
  state => ({
    viewport: mapSelectors.selectViewports(state)[0],
    recentImagery: mapSelectors.selectRecentImagery(state),
  }),
  {
    updateRecentImagery: mapActions.updateRecentImagery,
    updateViewport: viewport => mapActions.updateViewport({ index: 0, viewport }),
  }
)(Component);
