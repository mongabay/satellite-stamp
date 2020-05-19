import React from 'react';
import PropTypes from 'prop-types';

import './style.scss';

const Attributions = ({ attributions }) => (
  <div className="c-tool-attributions">
    <span dangerouslySetInnerHTML={{ __html: attributions }} />
  </div>
);

Attributions.propTypes = {
  attributions: PropTypes.string.isRequired,
};

export default Attributions;
