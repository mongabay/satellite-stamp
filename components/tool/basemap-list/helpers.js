import { BASEMAPS } from 'components/map';

/**
 * Return whether the param (setting) of a basemap can be displayed
 * @param {string} basemap Basemap ID
 * @param {string} param Param ID
 * @param {string} mode Current mode of the application
 * @param {{ difference: string, layers: string[] }} modeParams Parameters of the mode
 * @returns {boolean}
 */
export const canShowParam = (basemap, param, mode, modeParams) => {
  const isParamHiddenInTemporalMode = !!BASEMAPS[basemap].params[param].hiddenInTemporalMode;
  const isTemporalMode =
    (mode === '2-vertical' || mode === '2-horizontal' || mode === '4') &&
    modeParams.difference === 'temporal' &&
    modeParams.layers.indexOf(basemap) !== -1;
  const isParamHiddenInAnimatedMode = !!BASEMAPS[basemap].params[param].hiddenInAnimatedMode;
  const isAnimated = mode === 'animated' && modeParams.layers.indexOf(basemap) !== -1;

  return (
    (!isParamHiddenInTemporalMode || !isTemporalMode) &&
    (!isParamHiddenInAnimatedMode || !isAnimated)
  );
};
