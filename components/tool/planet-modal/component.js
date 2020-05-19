import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';

import { BASEMAPS } from 'components/map/constants';
import Modal from 'components/modal';

import './style.scss';

const ToolPlanetModal = ({ basemap, basemapParams, updateBasemap, updateBasemapParams }) => {
  const [apiKey, setApiKey] = useState('');

  const onClose = useCallback(() => updateBasemap({ basemap: Object.keys(BASEMAPS)[0] }), [
    updateBasemap,
  ]);

  const onSubmit = useCallback(
    e => {
      e.preventDefault();
      if (apiKey.length) {
        updateBasemapParams({ ...basemapParams, key: apiKey });
      }
    },
    [apiKey, basemapParams, updateBasemapParams]
  );

  if (basemap !== 'planet' || basemapParams?.key?.length > 0) {
    return null;
  }

  return (
    <Modal title="Planet API key" open onClose={onClose} className="c-tool-planet-modal">
      <h1 className="mb-3">Planet API key</h1>
      <p>
        The Planet basemap requires an API key. Consult {"Planet's "}
        <a
          href="https://www.planet.com/products/basemap/"
          target="_blank"
          rel="noopener noreferrer"
        >
          website
        </a>{' '}
        for more information.
      </p>
      <form className="mt-4" onSubmit={onSubmit}>
        <div className="form-group">
          <label htmlFor="planet-api-key">API key</label>
          <input
            type="text"
            id="planet-api-key"
            className="form-control"
            value={apiKey}
            onChange={({ target }) => setApiKey(target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary btn-block mt-4">
          Done
        </button>
      </form>
    </Modal>
  );
};

ToolPlanetModal.propTypes = {
  basemap: PropTypes.string.isRequired,
  basemapParams: PropTypes.object,
  updateBasemap: PropTypes.func.isRequired,
  updateBasemapParams: PropTypes.func.isRequired,
};

ToolPlanetModal.defaultProps = {
  basemapParams: null,
};

export default ToolPlanetModal;
