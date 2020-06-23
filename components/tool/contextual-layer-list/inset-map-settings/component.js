import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

import { Checkbox } from 'components/forms';

import './style.scss';

const InsetMapSettings = ({ showMap, toggleMap }) => {
  const onToggle = useCallback(() => toggleMap(!showMap), [showMap, toggleMap]);

  return (
    <div className="c-tool-inset-map-settings">
      <div className="group">
        <Checkbox
          id={`contextual-layer-inset-map`}
          name="contextual-layer"
          checked={showMap}
          onChange={onToggle}
        >
          Inset map
        </Checkbox>
        {showMap && (
          <div className="params">
            <div className="note">
              Note the inset map is only displayed on the single map layout.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

InsetMapSettings.propTypes = {
  showMap: PropTypes.bool.isRequired,
  toggleMap: PropTypes.func.isRequired,
};

export default InsetMapSettings;
