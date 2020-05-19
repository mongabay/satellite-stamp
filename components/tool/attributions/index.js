import { connect } from 'react-redux';

import { mapSelectors } from 'modules/tool';
import Component from './component';

export default connect(state => ({
  attributions: mapSelectors.selectAttributions(state),
}))(Component);
