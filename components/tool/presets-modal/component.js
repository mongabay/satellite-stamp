import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

import { toggleBasemap, toggleContextualLayers, getLayerDef } from 'utils/map';
import Modal from 'components/modal';
import {
  BASEMAPS,
  CONTEXTUAL_LAYERS,
  PRESETS,
  DATA_LAYERS,
  mapStyle,
  Map,
  LayerManager,
} from 'components/map';

import './style.scss';

const ToolPresetsModal = ({ open, onClose, updateActiveLayers }) => {
  const onLoadMap = useCallback(({ map }) => {
    toggleBasemap(map, BASEMAPS['mongabay-paper']);
    toggleContextualLayers(map, [CONTEXTUAL_LAYERS.water]);
  }, []);

  const onSelect = useCallback(
    preset => {
      updateActiveLayers(PRESETS[preset.id].layers.map(layer => layer.id).reverse());
      onClose();
    },
    [updateActiveLayers, onClose]
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
                  isStatic
                  mapStyle={mapStyle}
                  viewport={{
                    zoom: 2,
                    latitude: -20.55,
                    longitude: -58.01,
                    transitionDuration: 250,
                    bounds: null,
                  }}
                  onLoad={onLoadMap}
                >
                  {map => (
                    <LayerManager
                      map={map}
                      providers={{}}
                      layers={preset.layers.map(layer =>
                        getLayerDef(layer.id, DATA_LAYERS[layer.id], {})
                      )}
                    />
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
};

export default ToolPresetsModal;
