import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import { BASEMAPS } from 'components/map/constants';
import { Select } from 'components/forms';
import { getPlanetBasemapConfig } from './helpers';

const PlanetSettings = ({ basemapParams, updatebasemapParams }) => {
  const [basemapConfig, setBasemapConfig] = useState(null);

  useEffect(() => {
    const setConfig = async () => {
      const config = await getPlanetBasemapConfig(basemapParams.key);
      setBasemapConfig(config);
    };

    if (basemapParams?.key?.length > 0 && !basemapConfig) {
      setConfig();
    }
  }, [basemapParams, basemapConfig, setBasemapConfig]);

  return (
    <div className="basemap-params">
      <div className="param">
        <label htmlFor="basemap-planet-key">{BASEMAPS.planet.params.key.label}</label>
        <div className="input-group input-group-sm">
          <input
            type="text"
            id="basemap-planet-key"
            className="form-control"
            value={basemapParams.key || ''}
            onChange={({ target }) => updatebasemapParams({ ...basemapParams, key: target.value })}
          />
        </div>
      </div>
      <div className="param">
        <label htmlFor="basemap-planet-interval">{BASEMAPS.planet.params.interval.label}</label>
        <div className="input-group input-group-sm">
          <Select
            id="basemap-planet-interval"
            value={basemapParams.interval || ''}
            options={[
              { label: 'Choose option', value: '', disabled: true },
              ...BASEMAPS.planet.params.interval.values.map(value => ({
                label: `${value}`,
                value: `${value}`,
              })),
            ]}
            onChange={({ value }) =>
              updatebasemapParams({ ...basemapParams, interval: value, year: '', period: '' })
            }
          />
        </div>
      </div>
      <div className="param">
        <label htmlFor="basemap-planet-year">{BASEMAPS.planet.params.year.label}</label>
        <div className="input-group input-group-sm">
          <Select
            id="basemap-planet-year"
            value={basemapParams.year || ''}
            options={[
              { label: 'Choose option', value: '', disabled: true },
              ...(basemapConfig && basemapParams.interval
                ? Object.keys(basemapConfig[basemapParams.interval]).map(year => ({
                    label: year,
                    value: year,
                  }))
                : []),
            ]}
            onChange={({ value }) =>
              updatebasemapParams({ ...basemapParams, year: value, period: '' })
            }
          />
        </div>
      </div>
      <div className="param">
        <label htmlFor="basemap-planet-period">{BASEMAPS.planet.params.period.label}</label>
        <div className="input-group input-group-sm">
          <Select
            id="basemap-planet-period"
            value={basemapParams.period || ''}
            options={[
              { label: 'Choose option', value: '', disabled: true },
              ...(basemapConfig && basemapParams.interval && basemapParams.year
                ? basemapConfig[basemapParams.interval][basemapParams.year].map(period => ({
                    label: period,
                    value: period,
                  }))
                : []),
            ]}
            onChange={({ value }) => updatebasemapParams({ ...basemapParams, period: value })}
          />
        </div>
      </div>
    </div>
  );
};

PlanetSettings.propTypes = {
  basemapParams: PropTypes.object,
  updatebasemapParams: PropTypes.func.isRequired,
};

PlanetSettings.defaultProps = {
  basemapParams: null,
};

export default PlanetSettings;
