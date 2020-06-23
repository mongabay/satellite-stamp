import React, { Fragment } from 'react';
import PropTypes from 'prop-types';

import { DATA_LAYERS, DATA_LAYERS_GROUPS } from 'components/map';
import { Checkbox, Select } from 'components/forms';

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
                      <div key={param} className="param">
                        <label htmlFor={`basemap-${layer.id}-${param}`}>
                          {layer.params[param].label}
                        </label>
                        <div className="input-group input-group-sm">
                          {Array.isArray(layer.params[param].values) && (
                            <Select
                              id={`basemap-${layer.id}-${param}`}
                              value={`${layers[layer.id][param] ?? layer.params[param].default}`}
                              options={layer.params[param].values.map(value => ({
                                label: `${value}`,
                                value: `${value}`,
                              }))}
                              onChange={({ value }) =>
                                updateLayer({ id: layer.id, [param]: value })
                              }
                            />
                          )}
                          {!Array.isArray(layer.params[param].values) && (
                            <input
                              type="text"
                              id={`basemap-${key}-${param}`}
                              className="form-control"
                              value={layers[layer.id][param] || ''}
                              onChange={({ target }) =>
                                updateLayer({ id: layer.id, [param]: target.value })
                              }
                            />
                          )}
                        </div>
                      </div>
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
