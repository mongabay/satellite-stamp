import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

import { toggleBasemap, toggleContextualLayers } from 'utils/map';
import Modal from 'components/modal';
import { BASEMAPS, CONTEXTUAL_LAYERS, PRESETS, mapStyle, Map, LayerManager } from 'components/map';
import { getPresetLayers } from './helpers';

import './style.scss';

const ToolPresetsModal = ({
  open,
  onClose,
  updateActiveLayers,
  updateContextualLayers,
  updateBasemap,
}) => {
  const onLoadMap = useCallback((map, preset) => {
    toggleBasemap(map, BASEMAPS[preset.basemap]);
    toggleContextualLayers(
      map,
      preset.contextualLayers.map(layerId => CONTEXTUAL_LAYERS[layerId.id])
    );
  }, []);

  const onSelect = useCallback(
    preset => {
      // We reverse the array so the first layer is on top
      updateActiveLayers(PRESETS[preset.id].dataLayers.map(layer => layer.id).reverse());
      updateContextualLayers(PRESETS[preset.id].contextualLayers.map(layer => layer.id));
      updateBasemap({
        basemap: PRESETS[preset.id].basemap,
        params: BASEMAPS[preset.basemap].params
          ? Object.keys(BASEMAPS[preset.basemap].params).reduce(
              (res, key) => ({
                ...res,
                [key]: BASEMAPS[preset.basemap].params[key].default,
              }),
              {}
            )
          : {},
      });
      onClose();
    },
    [updateActiveLayers, updateContextualLayers, updateBasemap, onClose]
  );

  return (
    <Modal title="Presets" open={open} onClose={onClose} className="c-tool-presets-modal">
      <ul className="presets-list">
        {Object.keys(PRESETS)
          .map(preset => ({ ...PRESETS[preset], id: preset }))
          .sort((a, b) => a.label.localeCompare(b.label))
          .map(preset => (
            <li
              key={preset.id}
              className="preset"
              style={{
                flexBasis: `calc(${100 / Object.keys(PRESETS).length}% - (${(Object.keys(PRESETS)
                  .length -
                  1) /
                  Object.keys(PRESETS).length}) * 20px)`,
              }}
            >
              <button type="button" onClick={() => onSelect(preset)}>
                <Map
                  mapStyle={mapStyle}
                  viewport={{
                    zoom: 2,
                    latitude: -20.55,
                    longitude: -58.01,
                    transitionDuration: 250,
                    bounds: null,
                  }}
                  onLoad={map => onLoadMap(map, preset)}
                >
                  {map => (
                    <LayerManager map={map} providers={{}} layers={getPresetLayers(preset)} />
                  )}
                </Map>
                <div className="h1 mt-3 text-center">{preset.label}</div>
              </button>
            </li>
          ))}
      </ul>
      <button type="submit" className="btn btn-primary d-block mt-4 mx-auto" onClick={onClose}>
        Cancel
      </button>
    </Modal>
  );
};

ToolPresetsModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  updateActiveLayers: PropTypes.func.isRequired,
  updateContextualLayers: PropTypes.func.isRequired,
  updateBasemap: PropTypes.func.isRequired,
};

export default ToolPresetsModal;
