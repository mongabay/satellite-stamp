import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

const LegendTitle = ({ exporting, layerGroup }) => {
  const layer = layerGroup.layers[0];

  // The layer may not have a timelineParams object if it is used for the temporal difference
  if (exporting && layer.timelineParams) {
    const { timelineParams } = layer;
    const format = timelineParams.dateFormat;

    let suffix = null;
    if (timelineParams.range === false) {
      const date = timelineParams.endDate;
      suffix = <span className="ml-1">({moment(date).format(format)})</span>;
    } else {
      // html2canvas has a bug which overlaps the suffix on Chrome for specific layers like GLAD
      // alerts: https://github.com/niklasvh/html2canvas/issues/2213
      // As a workaround, we display the long suffixes on a new line
      const { startDate, endDate } = timelineParams;
      suffix = (
        <div className="mt-1 font-weight-normal">
          Between <span className="font-weight-bold">{moment(startDate).format(format)}</span> and{' '}
          <span className="font-weight-bold">{moment(endDate).format(format)}</span>
        </div>
      );
    }

    return (
      <div className="c-map-legend-title">
        {layer.name}
        {suffix}
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
