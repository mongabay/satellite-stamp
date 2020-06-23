import React, { Fragment } from 'react';
import PropTypes from 'prop-types';

import { DATA_LAYERS, DATA_LAYERS_GROUPS } from 'components/map';
import { Checkbox } from 'components/forms';
import Param from './param';

import './style.scss';

const GROUPS = Object.keys(DATA_LAYERS).reduce((res, key) => {
  const groups = { ...res };
  const group = DATA_LAYERS[key].group;

  if (groups[group]) {
    groups[group].layers = [
      ...groups[group].layers,
      { ...DATA_LAYERS[key], id: key },
    ].sort((a, b) => a.label.localeCompare(b.label));
  } else {
    groups[group] = {
      label: DATA_LAYERS_GROUPS[group],
      layers: [{ ...DATA_LAYERS[key], id: key }],
    };
  }

  return groups;
}, {});

const DataLayerList = ({ activeLayers, layers, removeLayer, addLayer, updateLayer }) => {
  return (
    <div className="c-tool-data-layer-list">
      {Object.keys(GROUPS)
        .sort((a, b) => GROUPS[a].label.localeCompare(GROUPS[b].label))
        .map(key => (
          <div key={key} className="group">
            <h2>{GROUPS[key].label}</h2>
            {GROUPS[key].layers.map(layer => (
              <Fragment key={layer.id}>
                <Checkbox
                  id={`data-layers-${layer.id}`}
                  name="data-layers"
                  checked={activeLayers.indexOf(layer.id) !== -1}
                  onChange={() => {
                    if (activeLayers.indexOf(layer.id) !== -1) {
                      removeLayer(layer.id);
                    } else {
                      addLayer(layer.id);
                    }
                  }}
                >
                  {layer.label}
                </Checkbox>
                {activeLayers.indexOf(layer.id) !== -1 && !!layer.params && (
                  <div className="params">
                    {Object.keys(layer.params).map(param => (
                      <Param
                        key={param}
                        param={param}
                        paramConfig={layer.params[param]}
                        paramValue={layers[layer.id][param]}
                        onChange={value => updateLayer({ id: layer.id, [param]: value })}
                      />
                    ))}
                  </div>
                )}
              </Fragment>
            ))}
          </div>
        ))}
    </div>
  );
};

DataLayerList.propTypes = {
  activeLayers: PropTypes.arrayOf(PropTypes.string).isRequired,
  layers: PropTypes.object.isRequired,
  addLayer: PropTypes.func.isRequired,
  removeLayer: PropTypes.func.isRequired,
  updateLayer: PropTypes.func.isRequired,
};

export default DataLayerList;
