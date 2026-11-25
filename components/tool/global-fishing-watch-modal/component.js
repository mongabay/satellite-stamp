import React, { useState, useCallback, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';

import { DATA_LAYERS, GLOBAL_FISHING_WATCH_LAYERS } from 'components/map';
import Modal from 'components/modal';

import './style.scss';

const ToolGlobalFishingWatchModal = ({ layers, updateLayer, removeLayer }) => {
  // First active layer that is missing its token
  const layerId = useMemo(
    () => GLOBAL_FISHING_WATCH_LAYERS.find(id => !!layers[id] && !layers[id].token),
    [layers]
  );

  // Token of another active layer, used to pre-fill the input
  const existingToken = useMemo(
    () => GLOBAL_FISHING_WATCH_LAYERS.map(id => layers[id]?.token).find(token => !!token) ?? '',
    [layers]
  );

  const [token, setToken] = useState(existingToken);

  useEffect(() => {
    setToken(existingToken);
  }, [layerId, existingToken]);

  // If the user doesn't provide a token, the layer is removed
  const onClose = useCallback(() => removeLayer(layerId), [layerId, removeLayer]);

  const onSubmit = useCallback(
    e => {
      e.preventDefault();
      if (token.trim().length) {
        updateLayer({ id: layerId, token: token.trim() });
      }
    },
    [layerId, token, updateLayer]
  );

  if (!layerId) {
    return null;
  }

  return (
    <Modal
      title="Global Fishing Watch API token"
      open
      onClose={onClose}
      className="c-tool-global-fishing-watch-modal"
    >
      <h1 className="mb-3">Global Fishing Watch API token</h1>
      <p>
        The {DATA_LAYERS[layerId].label} layer requires a Global Fishing Watch API token. You can
        create one for free on {"Global Fishing Watch's "}
        <a
          href="https://globalfishingwatch.org/our-apis/tokens"
          target="_blank"
          rel="noopener noreferrer"
        >
          website
        </a>
        .
      </p>
      <form className="mt-4" onSubmit={onSubmit}>
        <div className="form-group">
          <label htmlFor="global-fishing-watch-token">API token</label>
          <input
            type="text"
            id="global-fishing-watch-token"
            className="form-control"
            autoComplete="off"
            value={token}
            onChange={({ target }) => setToken(target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary btn-block mt-4">
          Done
        </button>
      </form>
    </Modal>
  );
};

ToolGlobalFishingWatchModal.propTypes = {
  layers: PropTypes.object.isRequired,
  updateLayer: PropTypes.func.isRequired,
  removeLayer: PropTypes.func.isRequired,
};

export default ToolGlobalFishingWatchModal;
