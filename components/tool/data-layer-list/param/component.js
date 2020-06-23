import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import { Checkbox, Select } from 'components/forms';

import './style.scss';

const DataLayerListParam = ({ param, paramConfig, paramValue, onChange }) => {
  const inputType = useMemo(() => {
    let type = 'text';
    if (Array.isArray(paramConfig.values)) {
      type = 'select';
    } else if (paramConfig.values === undefined && typeof paramConfig.default === 'boolean') {
      type = 'checkbox';
    }

    return type;
  }, [paramConfig]);

  return (
    <div className="c-data-layer-list-param">
      {inputType !== 'checkbox' && (
        <label htmlFor={`data-layer-${param}`}>{paramConfig.label}</label>
      )}
      <div className="input-group input-group-sm">
        {inputType === 'select' && (
          <Select
            id={`data-layer-${param}`}
            value={`${paramValue ?? paramConfig.default}`}
            options={paramConfig.values.map(value => ({
              label: `${value}`,
              value: `${value}`,
            }))}
            onChange={({ value }) => onChange(value)}
          />
        )}
        {inputType === 'checkbox' && (
          <Checkbox
            id={`data-layer-${param}`}
            name={`data-layer-${param}`}
            checked={paramValue ?? paramConfig.default}
            onChange={({ target }) => onChange(target.checked)}
          >
            {paramConfig.label}
          </Checkbox>
        )}
        {inputType === 'text' && (
          <input
            type="text"
            id={`data-layer-${param}`}
            className="form-control"
            value={paramValue ?? paramConfig.default}
            onChange={({ target }) => onChange(target.value)}
          />
        )}
      </div>
    </div>
  );
};

DataLayerListParam.propTypes = {
  param: PropTypes.string.isRequired,
  paramConfig: PropTypes.object.isRequired,
  paramValue: PropTypes.any,
  onChange: PropTypes.func.isRequired,
};

DataLayerListParam.defaultProps = {
  paramSetting: null,
};

export default DataLayerListParam;
