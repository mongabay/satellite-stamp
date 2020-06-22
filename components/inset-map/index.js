import { connect } from 'react-redux';

import { mapSelectors } from 'modules/tool';
import Component from './component';

export default connect(state => ({ viewport: mapSelectors.selectViewports(state)[0] }))(Component);
