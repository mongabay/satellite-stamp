import React from 'react';
import PropTypes from 'prop-types';

import { BASEMAPS } from 'components/map';
import { Radio } from 'components/forms';

const BasemapList = ({ basemap, onChangeBasemap }) => (
  <div className="c-tool-basemap-list">
    {Object.keys(BASEMAPS)
      .sort((a, b) => BASEMAPS[a].label.localeCompare(BASEMAPS[b].label))
      .map(key => (
        <Radio
          key={key}
          id={`basemap-${key}`}
          name="basemap"
          checked={key === basemap}
          onChange={() => onChangeBasemap({ basemap: key })}
        >
          {BASEMAPS[key].label}
        </Radio>
      ))}
  </div>
);

BasemapList.propTypes = {
  basemap: PropTypes.string.isRequired,
  onChangeBasemap: PropTypes.func.isRequired,
};

export default BasemapList;
