import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

import { CONTEXTUAL_LAYERS } from 'components/map';
import { Checkbox, Radio } from 'components/forms';
import RecentImagerySettings from './recent-imagery-settings';
import InsetMapSettings from './inset-map-settings';

import './style.scss';

const ContextualLayerList = ({
  contextualLayers,
  addContextualLayer,
  removeContextualLayer,
  updateContextualLayers,
}) => {
  const onChange = useCallback(
    contextualLayerId => {
      if (contextualLayers.indexOf(contextualLayerId) !== -1) {
        removeContextualLayer(contextualLayerId);
      } else {
        const { group } = CONTEXTUAL_LAYERS[contextualLayerId];

        if (!group) {
          addContextualLayer(contextualLayerId);
        } else {
          const groupLayers = Object.keys(CONTEXTUAL_LAYERS).filter(
            key => CONTEXTUAL_LAYERS[key].group === group
          );

          updateContextualLayers([
            ...contextualLayers.filter(layerId => groupLayers.indexOf(layerId) === -1),
            contextualLayerId,
          ]);
        }
      }
    },
    [contextualLayers, addContextualLayer, removeContextualLayer, updateContextualLayers]
  );

  return (
    <div className="c-tool-contextual-layer-list">
      {Object.keys(CONTEXTUAL_LAYERS)
        .filter(key => !CONTEXTUAL_LAYERS[key].group)
        .sort((a, b) => CONTEXTUAL_LAYERS[a].label.localeCompare(CONTEXTUAL_LAYERS[b].label))
        .map(key => (
          <Checkbox
            key={key}
            id={`contextual-layer-${key}`}
            name="contextual-layer"
            checked={contextualLayers.indexOf(key) !== -1}
            onChange={() => onChange(key)}
          >
            {CONTEXTUAL_LAYERS[key].label}
          </Checkbox>
        ))}
      {Object.keys(CONTEXTUAL_LAYERS)
        .filter(key => CONTEXTUAL_LAYERS[key].group)
        .reduce((res, key) => {
          const { group } = CONTEXTUAL_LAYERS[key];
          const groupIndex = res.findIndex(item => item.group === group);

          if (groupIndex !== -1) {
            const newRes = [...res];
            newRes.splice(groupIndex, 1, { group, items: [...res[groupIndex].items, key] });
            return newRes;
          }

          return [...res, { group, items: [key] }];
        }, [])
        .map(group => (
          <div key={group} className="group">
            {group.items
              .sort((a, b) => CONTEXTUAL_LAYERS[a].label.localeCompare(CONTEXTUAL_LAYERS[b].label))
              .map(key => (
                <Radio
                  key={key}
                  id={`contextual-layer-${key}`}
                  name={`contextual-layer-${CONTEXTUAL_LAYERS[key].group}`}
                  checked={contextualLayers.indexOf(key) !== -1}
                  onChange={() => onChange(key)}
                >
                  {CONTEXTUAL_LAYERS[key].label}
                </Radio>
              ))}
          </div>
        ))}
      <InsetMapSettings />
      <RecentImagerySettings />
    </div>
  );
};

ContextualLayerList.propTypes = {
  contextualLayers: PropTypes.arrayOf(PropTypes.string).isRequired,
  addContextualLayer: PropTypes.func.isRequired,
  removeContextualLayer: PropTypes.func.isRequired,
  updateContextualLayers: PropTypes.func.isRequired,
};

export default ContextualLayerList;
