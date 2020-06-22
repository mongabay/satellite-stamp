import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { WebMercatorViewport } from 'react-map-gl';

import './style.scss';

// react-map-gl projects the coordinates in a Web Mercator tile of 512px dimension
const PROJECTED_DIMENSION = 512;

// Actual width of the inset map
const INSET_MAP_WIDTH = 150;

// The Web Mercator map is a square but the inset map we have is not
// If the dimensions of the map don't change, it's 6px short at the top and 44 at the bottom
const INSET_MAP_TOP_OFFSET = 6;
const INSET_MAP_BOTTOM_OFFSET = 44;

const InsetMap = ({ viewport }) => {
  const { latitude, longitude } = viewport;
  const [x, y] = useMemo(() => {
    const instance = new WebMercatorViewport();
    const [projectedX, projectedY] = instance.projectFlat([longitude, latitude]);

    const x = (projectedX / PROJECTED_DIMENSION) * INSET_MAP_WIDTH;

    // The Web Mercator map is a square but the inset map we have is not
    // If the dimensions of the map don't change, it's 6px short at the top and 44 at the bottom
    let y =
      ((PROJECTED_DIMENSION - projectedY) / PROJECTED_DIMENSION) * INSET_MAP_WIDTH -
      INSET_MAP_TOP_OFFSET;
    y = Math.min(y, INSET_MAP_WIDTH - INSET_MAP_TOP_OFFSET - INSET_MAP_BOTTOM_OFFSET);
    y = Math.max(0, y);

    return [x, y];
  }, [latitude, longitude]);

  return (
    <div className="c-inset-map">
      <div>
        <img src={`${process.env.BASE_PATH ?? ''}/images/inset-map@2x.png`} alt="World map" />
        <img
          src={`${process.env.BASE_PATH ?? ''}/images/inset-map-marker@2x.png`}
          alt="Marker"
          style={{ top: `${y}px`, left: `${x}px` }}
        />
      </div>
    </div>
  );
};

InsetMap.propTypes = {
  viewport: PropTypes.object.isRequired,
};

export default InsetMap;
