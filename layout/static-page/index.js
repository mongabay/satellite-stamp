import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import Head from 'components/head';
import Icons from 'components/icons';

import './style.scss';

const StaticPage = ({ className, children }) => (
  <div className={classNames('l-simple-page', className)}>
    <Head />
    <main className="l-static-page">{children}</main>
    <Icons />
  </div>
);

StaticPage.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

StaticPage.defaultProps = { className: null };

export default StaticPage;
