import React from 'react';
import PropTypes from 'prop-types';

import { CONTEXTUAL_LAYERS } from 'components/map';
import { Checkbox } from 'components/forms';

const ContextualLayerList = ({
  contextualLayers,
  onAddContextualLayer,
  onRemoveContextualLayer,
}) => (
  <div className="c-tool-contextual-layer-list">
    {Object.keys(CONTEXTUAL_LAYERS)
      .sort((a, b) => CONTEXTUAL_LAYERS[a].label.localeCompare(CONTEXTUAL_LAYERS[b].label))
      .map(key => (
        <Checkbox
          key={key}
          id={`contextual-layer-${key}`}
          name="contextual-layer"
          checked={contextualLayers.indexOf(key) !== -1}
          onChange={() =>
            contextualLayers.indexOf(key) !== -1
              ? onRemoveContextualLayer(key)
              : onAddContextualLayer(key)
          }
        >
          {CONTEXTUAL_LAYERS[key].label}
        </Checkbox>
      ))}
  </div>
);

ContextualLayerList.propTypes = {
  contextualLayers: PropTypes.arrayOf(PropTypes.string).isRequired,
  onAddContextualLayer: PropTypes.func.isRequired,
  onRemoveContextualLayer: PropTypes.func.isRequired,
};

export default ContextualLayerList;
