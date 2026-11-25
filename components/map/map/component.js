import React, { forwardRef, useRef, useMemo, useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import ReactMapGL from 'react-map-gl';
import composeRefs from '@seznam/compose-react-refs';

import './style.scss';

export { ScaleControl, Popup } from 'react-map-gl';
export const DEFAULT_VIEWPORT = {
  zoom: 2,
  latitude: 0,
  longitude: 0,
};

const Comp = (
  {
    className,
    viewport,
    mapStyle,
    transformRequest,
    onLoad,
    onViewportChange,
    onBusy,
    onIdle,
    children,
    ...rest
  },
  ref
) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [internalViewport, setInternalViewport] = useState(viewport);

  // `transformRequest` is only read by react-map-gl when the map is created, so the prop is
  // accessed through a ref to always call its latest value
  const transformRequestRef = useRef(transformRequest);
  transformRequestRef.current = transformRequest;

  const inner = useMemo(() => {
    if (typeof children === 'function') {
      if (loaded) {
        return children(map.current.getMap());
      } else {
        return null;
      }
    } else {
      return children;
    }
  }, [children, map, loaded]);

  const onLoadMap = useCallback(() => {
    onLoad(map.current.getMap());

    // When the map is mounted, the bounds of the map are saved
    onViewportChange?.({
      ...viewport,
      bounds: map.current
        .getMap()
        .getBounds()
        .toArray(),
    });

    setLoaded(true);
  }, [viewport, onViewportChange, onLoad, setLoaded]);

  const onChangeViewport = useCallback(
    v => {
      const newViewport = {
        ...v,
        ...(loaded
          ? {
              bounds: map.current
                .getMap()
                .getBounds()
                .toArray(),
            }
          : {}),
      };

      setInternalViewport(newViewport);
      onViewportChange?.(newViewport);
    },
    [loaded, setInternalViewport, onViewportChange]
  );

  useEffect(() => {
    setInternalViewport(viewport);
  }, [viewport, onViewportChange, setInternalViewport]);

  useEffect(() => {
    if (loaded && onBusy) {
      map.current.getMap().on('dataloading', onBusy);
    }

    return () => {
      if (loaded) {
        map.current.getMap().off('dataloading', onBusy);
      }
    };
  }, [loaded, onBusy]);

  useEffect(() => {
    if (loaded && onIdle) {
      map.current.getMap().on('idle', onIdle);
    }

    return () => {
      if (loaded) {
        map.current.getMap().off('idle', onIdle);
      }
    };
  }, [loaded, onIdle]);

  return (
    <div ref={mapContainer} className={['c-map', ...(className ? [className] : [])].join(' ')}>
      <ReactMapGL
        ref={composeRefs(map, ref)}
        mapboxApiAccessToken={process.env.MAPBOX_API_KEY}
        disableTokenWarning={true}
        width="100%"
        height="100%"
        mapStyle={mapStyle}
        {...internalViewport}
        maxPitch={0}
        dragRotate={false}
        // If there isn't onViewportChange, then the map should be static
        onViewportChange={onViewportChange ? onChangeViewport : undefined}
        onLoad={onLoadMap}
        getCursor={({ isHovering, isDragging }) => {
          if (!onViewportChange) return 'default';
          if (isHovering) return 'pointer';
          if (isDragging) return 'grabbing';
          return 'grab';
        }}
        transformRequest={(url, resourceType) =>
          transformRequestRef.current?.(url, resourceType) ?? null
        }
        {...rest}
      >
        {inner}
      </ReactMapGL>
    </div>
  );
};

const Map = forwardRef(Comp);

Map.displayName = 'Map';

Map.propTypes = {
  className: PropTypes.string,
  viewport: PropTypes.shape({
    latitude: PropTypes.number.isRequired,
    longitude: PropTypes.number.isRequired,
    zoom: PropTypes.number.isRequired,
  }),
  mapStyle: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  transformRequest: PropTypes.func,
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  onLoad: PropTypes.func,
  onViewportChange: PropTypes.func,
  onBusy: PropTypes.func,
  onIdle: PropTypes.func,
};

Map.defaultProps = {
  className: undefined,
  viewport: DEFAULT_VIEWPORT,
  mapboxStyle: undefined,
  transformRequest: undefined,
  children: undefined,
  onLoad: () => null,
  onViewportChange: undefined,
  onBusy: undefined,
  onIdle: undefined,
};

export default Map;
