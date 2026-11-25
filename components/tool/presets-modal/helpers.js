import { getLayerDef, getBasemapDef } from 'utils/map';
import { DATA_LAYERS, BASEMAPS } from 'components/map';

export const getPresetLayers = preset => {
  const res = preset.dataLayers
    .map(layer => getLayerDef(layer.id, DATA_LAYERS[layer.id], {}))
    // Layers which can't be displayed yet don't have a definition
    .filter(layerDef => !!layerDef);

  const basemapParams = BASEMAPS[preset.basemap].params;
  const basemapDef = getBasemapDef(
    preset.basemap,
    BASEMAPS[preset.basemap],
    basemapParams
      ? Object.keys(basemapParams).reduce(
          (res, key) => ({
            ...res,
            [key]: basemapParams[key].default,
          }),
          {}
        )
      : {}
  );

  if (basemapDef) {
    res.push(basemapDef);
  }

  return res;
};
