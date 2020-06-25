import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import { Router } from 'lib/routes';
import { DATA_LAYERS } from 'components/map';
import Sidebar from './sidebar';
import Visualization from './visualization';
import PlanetModal from './planet-modal';
import PresetsModal from './presets-modal';

import './style.scss';
import LoadingSpinner from 'components/loading-spinner';

const Tool = ({ serializedState, restoring, restoreState }) => {
  const [presetsOpen, setPresetsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // When the component is mounted, we restore its state from the URL
  useEffect(() => {
    restoreState();
  }, [restoreState]);

  // Each time the serialized state of the component changes, we update the URL
  useEffect(() => {
    Router.replaceRoute('home', { state: serializedState });
  }, [serializedState]);

  // When we init the app, we also want to initialize the layers that need to do so
  useEffect(() => {
    setLoading(true);

    // NOTE: this action will mutate DATA_LAYERS which is not ideal, but is simple enough to update
    // at a later point
    Promise.all(
      Object.keys(DATA_LAYERS)
        .filter(layerId => !!DATA_LAYERS[layerId].init)
        .map(layerId => DATA_LAYERS[layerId].init(DATA_LAYERS[layerId]))
    ).then(() => setLoading(false));
  }, []);

  return (
    <div className="c-tool">
      {(loading || restoring) && <LoadingSpinner />}
      {!loading && !restoring && (
        <>
          <PlanetModal />
          <PresetsModal open={presetsOpen} onClose={() => setPresetsOpen(false)} />
          <Sidebar onClickPresets={() => setPresetsOpen(true)} />
          <Visualization />
        </>
      )}
    </div>
  );
};

Tool.propTypes = {
  serializedState: PropTypes.string.isRequired,
  restoring: PropTypes.bool.isRequired,
  restoreState: PropTypes.func.isRequired,
};

export default Tool;
