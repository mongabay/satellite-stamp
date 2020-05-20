import { connect } from 'react-redux';

import { mapActions } from 'modules/tool';
import Component from './component';

export default connect(null, {
  updateActiveLayers: mapActions.updateActiveLayers,
})(Component);
