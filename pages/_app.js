import React from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import withRedux from 'next-redux-wrapper';

import createStore from 'lib/store';
import { updateRoute } from 'modules/routing';

import 'css/index.scss';

const SatelliteStampApp = ({ Component, pageProps, store }) => {
  return (
    <Provider store={store}>
      <Component {...pageProps} />
    </Provider>
  );
};

SatelliteStampApp.getInitialProps = async ({ Component, router, ctx }) => {
  const { asPath } = router;
  const { req, query, store } = ctx;

  const pathname = req ? asPath : ctx.asPath;

  // We save the route in Redux
  if (pathname) {
    store.dispatch(updateRoute({ pathname, query }));
  }

  const pageProps = Component.getInitialProps ? await Component.getInitialProps(ctx) : {};

  return { pageProps };
};

SatelliteStampApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.any.isRequired,
  store: PropTypes.any.isRequired,
};

export default withRedux(createStore)(SatelliteStampApp);
