import React from 'react';
import PropTypes from 'prop-types';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';

import BoundingBox from './bounding-box';
import './style.scss';

const InsetMap = ({ viewport }) => {
  const { latitude, longitude, zoom, bounds } = viewport;

  return (
    <div className="c-inset-map">
      {zoom > 5 && (
        <div>
          <ComposableMap
            width={150}
            height={100}
            projection="geoMercator"
            projectionConfig={{ scale: 200, center: [longitude, latitude] }}
          >
            <Geographies geography={`${process.env.BASE_PATH ?? ''}/data/world.json`}>
              {({ geographies }) =>
                geographies.map(geo => (
                  <Geography key={geo.rsmKey} geography={geo} strokeWidth={1} />
                ))
              }
            </Geographies>
            {bounds && <BoundingBox bounds={bounds} center={[latitude, longitude]} noWrap />}
          </ComposableMap>
        </div>
      )}
      <div>
        <ComposableMap
          width={150}
          height={100}
          projection="geoMercator"
          projectionConfig={{ scale: 23, center: [0, 45] }}
        >
          <Geographies geography={`${process.env.BASE_PATH ?? ''}/data/world.json`}>
            {({ geographies }) =>
              geographies.map(geo => (
                <Geography key={geo.rsmKey} geography={geo} strokeWidth={0.2} />
              ))
            }
          </Geographies>
          {bounds && <BoundingBox bounds={bounds} center={[latitude, longitude]} />}
        </ComposableMap>
      </div>
    </div>
  );
};

InsetMap.propTypes = {
  viewport: PropTypes.object.isRequired,
};

export default InsetMap;
