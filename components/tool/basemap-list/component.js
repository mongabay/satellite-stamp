import React, { Fragment, useCallback } from 'react';
import PropTypes from 'prop-types';

import { BASEMAPS } from 'components/map';
import { Radio, Select } from 'components/forms';
import PlanetSettings from './planet-settings';

import './style.scss';

const BasemapList = ({ basemap, basemapParams, onChangeBasemap, onChangeBasemapParams }) => {
  const onChange = useCallback(
    key =>
      onChangeBasemap({
        basemap: key,
        ...(BASEMAPS[key].params
          ? {
              params: Object.keys(BASEMAPS[key].params).reduce(
                (res, param) => ({
                  ...res,
                  [param]: `${BASEMAPS[key].params[param].default}`,
                }),
                {}
              ),
            }
          : {}),
      }),
    [onChangeBasemap]
  );

  const onChangeParams = useCallback(
    (param, value) => onChangeBasemapParams({ ...basemapParams, [param]: value }),
    [basemapParams, onChangeBasemapParams]
  );

  return (
    <div className="c-tool-basemap-list">
      {Object.keys(BASEMAPS)
        .sort((a, b) => BASEMAPS[a].label.localeCompare(BASEMAPS[b].label))
        .map(key => (
          <Fragment key={key}>
            <Radio
              key={key}
              id={`basemap-${key}`}
              name="basemap"
              checked={key === basemap}
              onChange={() => onChange(key)}
            >
              {BASEMAPS[key].label}
            </Radio>
            {key === basemap && BASEMAPS[key].params && basemap !== 'planet' && (
              <div className="basemap-params">
                {Object.keys(BASEMAPS[key].params).map(param => (
                  <div key={param} className="param">
                    <label htmlFor={`basemap-${key}-${param}`}>
                      {BASEMAPS[key].params[param].label}
                    </label>
                    <div className="input-group input-group-sm">
                      {Array.isArray(BASEMAPS[key].params[param].values) && (
                        <Select
                          id={`basemap-${key}-${param}`}
                          value={`${basemapParams[param]}`}
                          options={BASEMAPS[key].params[param].values.map(value => ({
                            label: `${value}`,
                            value: `${value}`,
                          }))}
                          onChange={({ value }) => onChangeParams(param, value)}
                        />
                      )}
                      {!Array.isArray(BASEMAPS[key].params[param].values) && (
                        <input
                          type="text"
                          id={`basemap-${key}-${param}`}
                          className="form-control"
                          value={basemapParams[param] || ''}
                          onChange={({ target }) => onChangeParams(param, target.value)}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {key === basemap && BASEMAPS[key].params && basemap === 'planet' && <PlanetSettings />}
          </Fragment>
        ))}
    </div>
  );
};

BasemapList.propTypes = {
  basemap: PropTypes.string.isRequired,
  basemapParams: PropTypes.object,
  onChangeBasemap: PropTypes.func.isRequired,
  onChangeBasemapParams: PropTypes.func.isRequired,
};

BasemapList.defaultProps = {
  basemapParams: null,
};

export default BasemapList;
