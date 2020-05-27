import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import { Router } from 'lib/routes';
import Sidebar from './sidebar';
import Visualization from './visualization';
import PlanetModal from './planet-modal';
import PresetsModal from './presets-modal';

import './style.scss';

const Tool = ({ serializedState, restoreState }) => {
  const [presetsOpen, setPresetsOpen] = useState(false);

  // When the component is mounted, we restore its state from the URL
  useEffect(() => {
    restoreState();
  }, [restoreState]);

  // Each time the serialized state of the component changes, we update the URL
  useEffect(() => {
    Router.replaceRoute('home', { state: serializedState });
  }, [serializedState]);

  return (
    <div className="c-tool">
      <PlanetModal />
      <PresetsModal open={presetsOpen} onClose={() => setPresetsOpen(false)} />
      <Sidebar onClickPresets={() => setPresetsOpen(true)} />
      <Visualization />
    </div>
  );
};

Tool.propTypes = {
  serializedState: PropTypes.string.isRequired,
  restoreState: PropTypes.func.isRequired,
};

export default Tool;
