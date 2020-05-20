import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash/debounce';

import { Router } from 'lib/routes';
import { toggleBasemap, toggleContextualLayers } from 'utils/map';
import { Accordion, AccordionItem, AccordionTitle, AccordionPanel } from 'components/accordion';
import { Checkbox } from 'components/forms';
import {
  BASEMAPS,
  CONTEXTUAL_LAYERS,
  DATA_LAYERS,
  mapStyle,
  Map,
  LayerManager,
  Legend,
} from 'components/map';
import Attributions from './attributions';
import BasemapList from './basemap-list';
import ContextualLayerList from './contextual-layer-list';
import PlanetModal from './planet-modal';

import './style.scss';

const Tool = ({
  viewport,
  basemap,
  contextualLayers,
  activeLayers,
  activeLayersDef,
  legendDataLayers,
  serializedState,
  restoreState,
  updateViewport,
  addLayer,
  removeLayer,
  updateLayer,
  updateLayerOrder,
}) => {
  const mapRef = useRef(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const map = useMemo(() => mapRef.current?.map, [mapRef.current]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [expandedAccordion, setExpandedAccordion] = useState('data-layers');

  const onChangeViewport = useCallback(
    // @ts-ignore
    debounce(v => {
      updateViewport({
        zoom: v.zoom,
        latitude: v.latitude,
        longitude: v.longitude,
        bounds: v.bounds,
      });
    }, 500),
    [updateViewport]
  );

  const onLoadMap = useCallback(() => {
    setMapLoaded(true);
    toggleBasemap(map, BASEMAPS[basemap]);
  }, [map, basemap]);

  // When the component is mounted, we restore its state from the URL
  useEffect(() => {
    restoreState();
  }, [restoreState]);

  // Each time the serialized state of the component changes, we update the URL
  useEffect(() => {
    Router.replaceRoute('home', { state: serializedState });
  }, [serializedState]);

  // When the basemap or contextual layers change, we update the map style
  useEffect(() => {
    if (map && mapLoaded) {
      toggleBasemap(map, BASEMAPS[basemap]);
      toggleContextualLayers(
        map,
        contextualLayers.map(l => CONTEXTUAL_LAYERS[l])
      );
    }
  }, [map, mapLoaded, basemap, contextualLayers]);

  return (
    <div className="c-tool">
      <PlanetModal />
      <aside>
        <Accordion
          multi={false}
          expanded={[expandedAccordion]}
          onChange={uuids => setExpandedAccordion(uuids[0] ?? null)}
        >
          <AccordionItem
            id="data-layers"
            className={expandedAccordion === 'data-layers' ? '-expanded' : null}
          >
            <AccordionTitle aria-level={1}>
              <span className="h1">Data layers</span>
            </AccordionTitle>
            <AccordionPanel>
              <div className="pt-2">
                {Object.keys(DATA_LAYERS)
                  .sort((a, b) => DATA_LAYERS[a].label.localeCompare(DATA_LAYERS[b].label))
                  .map(key => (
                    <Checkbox
                      key={key}
                      id={`data-layers-${key}`}
                      name="data-layers"
                      checked={activeLayers.indexOf(key) !== -1}
                      onChange={() => {
                        if (activeLayers.indexOf(key) !== -1) {
                          removeLayer(key);
                        } else {
                          addLayer(key);
                        }
                      }}
                    >
                      {DATA_LAYERS[key].label}
                    </Checkbox>
                  ))}
              </div>
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem
            id="contextual-layers"
            className={expandedAccordion === 'contextual-layers' ? '-expanded' : null}
          >
            <AccordionTitle aria-level={1}>
              <span className="h1">Contextual layers</span>
            </AccordionTitle>
            <AccordionPanel>
              <ContextualLayerList />
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem
            id="basemap"
            className={expandedAccordion === 'basemap' ? '-expanded' : null}
          >
            <AccordionTitle aria-level={1}>
              <span className="h1">Basemap</span>
            </AccordionTitle>
            <AccordionPanel>
              <BasemapList />
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
        <div className="mt-4">
          <button type="button" className="btn btn-primary mr-2" disabled>
            Export
          </button>
          <button type="button" className="btn btn-outline-primary" disabled>
            Map presets
          </button>
        </div>
      </aside>
      <div className="visualization">
        <div className="map-container">
          <Legend
            layers={legendDataLayers}
            onChangeOpacity={(id, opacity) => updateLayer({ id, opacity })}
            onClickToggleVisibility={(id, visible) => updateLayer({ id, visible })}
            onClickRemove={removeLayer}
            onChangeDate={(id, dates) =>
              updateLayer({ id, dateRange: [dates[0], dates[2]], currentDate: dates[1] })
            }
            onChangeLayersOrder={updateLayerOrder}
          />
          <Map
            ref={mapRef}
            mapStyle={mapStyle}
            viewport={viewport}
            onViewportChange={onChangeViewport}
            onLoad={onLoadMap}
          >
            {map => <LayerManager map={map} providers={{}} layers={activeLayersDef} />}
          </Map>
          <Attributions />
        </div>
      </div>
    </div>
  );
};

Tool.propTypes = {
  zoom: PropTypes.number.isRequired,
  viewport: PropTypes.object.isRequired,
  basemap: PropTypes.string.isRequired,
  basemapParams: PropTypes.object,
  contextualLayers: PropTypes.arrayOf(PropTypes.string).isRequired,
  activeLayers: PropTypes.arrayOf(PropTypes.string).isRequired,
  activeLayersDef: PropTypes.arrayOf(PropTypes.object).isRequired,
  legendDataLayers: PropTypes.arrayOf(PropTypes.object).isRequired,
  serializedState: PropTypes.string.isRequired,
  restoreState: PropTypes.func.isRequired,
  updateZoom: PropTypes.func.isRequired,
  updateViewport: PropTypes.func.isRequired,
  updateBasemap: PropTypes.func.isRequired,
  updateBasemapParams: PropTypes.func.isRequired,
  addLayer: PropTypes.func.isRequired,
  removeLayer: PropTypes.func.isRequired,
  updateLayer: PropTypes.func.isRequired,
  updateLayerOrder: PropTypes.func.isRequired,
};

Tool.defaultProps = {
  basemapProps: null,
};

export default Tool;
