import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

const LegendTitle = ({ exporting, layerGroup }) => {
  const layer = layerGroup.layers[0];

  // The layer may not have a timelineParams object if it is used for the temporal difference
  if (exporting && layer.timelineParams) {
    const { timelineParams } = layer;
    const format = timelineParams.dateFormat;

    let suffix;
    if (timelineParams.range === false) {
      const date = timelineParams.endDate;
      suffix = moment(date).format(format);
    } else {
      const { startDate, endDate } = timelineParams;
      suffix = `${moment(startDate).format(format)} - ${moment(endDate).format(format)}`;
    }

    return (
      <div className="c-map-legend-title">
        {layer.name}
        {suffix ? ` (${suffix})` : ''}
      </div>
    );
  }

  return layer.name;
};

LegendTitle.propTypes = {
  exporting: PropTypes.bool.isRequired,
  layerGroup: PropTypes.object.isRequired,
};

export default LegendTitle;
