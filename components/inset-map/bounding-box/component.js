import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { MapContext } from 'react-simple-maps';

// Dimension exceeding the width of the inset map
const MAP_EXCEEDING_WIDTH = 1000;

const BoundingBox = ({ bounds, center, noWrap }) => {
  const { projection } = useContext(MapContext);

  const [x1, y2] = projection(bounds[0]);
  const [x2, y1] = projection(bounds[1]);

  const width = x2 - x1;
  const height = y2 - y1;

  const passesAntimeridian = x2 < x1;

  // Distance in pixels between the west and east longitudes
  // This calculation can only be used when the bounds span the antimeridian
  const longitudesDistance =
    x1 - projection([bounds[0][0] - (180 - bounds[0][0] + bounds[1][0] + 180), bounds[1][1]])[0];

  // If the rectangle is too small, we display a marker instead
  if (height < 5) {
    const [cx, cy] = projection(center.reverse());

    return (
      <>
        <circle cx={cx} cy={cy} r={5} fill="transparent" strokeWidth={1.5} className="outer" />
        <circle cx={cx} cy={cy} r={2} strokeWidth={0} className="inner" />
      </>
    );
  }

  if (!passesAntimeridian) {
    return <rect x={x1} y={y1} width={width} height={height} />;
  }

  if (passesAntimeridian && !noWrap) {
    return (
      <>
        <rect x={x1} y={y1} width={MAP_EXCEEDING_WIDTH} height={height} />
        <rect x={x2 - MAP_EXCEEDING_WIDTH} y={y1} width={MAP_EXCEEDING_WIDTH} height={height} />
      </>
    );
  }

  return <rect x={x1} y={y1} width={longitudesDistance} height={height} />;
};

BoundingBox.propTypes = {
  bounds: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)).isRequired,
  center: PropTypes.arrayOf(PropTypes.number).isRequired,
  noWrap: PropTypes.bool,
};

BoundingBox.defaultProps = {
  noWrap: false,
};

export default BoundingBox;
