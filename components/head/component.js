import React from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head';

const HeadComponent = ({ title, description }) => (
  <Head>
    <title key="title">{title ? `${title} | Earth Atlas` : 'Earth Atlas'}</title>
    <meta
      key="description"
      name="description"
      content={
        description
          ? description
          : 'Create images of maps using various basemaps, contextual and data layers, or explore the map presets about topics like conservation.'
      }
    />
  </Head>
);

HeadComponent.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
};

HeadComponent.defaultProps = {
  title: null,
  description: null,
};

export default HeadComponent;
