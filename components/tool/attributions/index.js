import { connect } from 'react-redux';

import { toolSelectors } from 'modules/tool';
import Component from './component';

export default connect(state => ({
  attributions: toolSelectors.selectAttributions(state),
}))(Component);
