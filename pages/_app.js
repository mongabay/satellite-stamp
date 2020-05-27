import React from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';

import store from 'lib/store';

import 'css/index.scss';

const SatelliteStampApp = ({ Component, pageProps }) => (
  <Provider store={store}>
    <Component {...pageProps} />
  </Provider>
);

SatelliteStampApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.any,
};

SatelliteStampApp.defaultProps = {
  pageProps: {},
};

export default SatelliteStampApp;
