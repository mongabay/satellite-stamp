import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import debounce from 'lodash/debounce';

import Icon from 'components/icon';
import { Select } from 'components/forms';
import { DATA_LAYERS } from 'components/map';
import { downloadImage } from './helper';

import './style.scss';

export const IMAGE_RATIO = 2 / 3;

const ExportTooltip = ({
  width,
  height,
  mode,
  modeParams,
  temporalDiffLayers,
  updateSettings,
  updateExporting,
  updateMode,
  updateModeParams,
}) => {
  const [form, setForm] = useState({
    width: {
      value: width,
      isValid: true,
    },
    height: {
      value: height,
      isValid: true,
    },
  });

  const debouncedUpdateSettings = useCallback(debounce(updateSettings, 500), [updateSettings]);

  const onChangeWidthOrHeight = useCallback(
    e => {
      const name = /** @type {'width' | 'height'} */ (e.target.name);
      const isValid = e.target.checkValidity();
      const value = isValid ? +e.target.value : e.target.value;

      if (!isValid) {
        setForm(f => ({ ...f, [name]: { value, isValid: false } }));
      } else {
        const otherName = name === 'width' ? 'height' : 'width';
        const otherValue = name === 'width' ? value * IMAGE_RATIO : value / IMAGE_RATIO;

        // @ts-ignore
        setForm({
          [name]: { value, isValid: true },
          [otherName]: { value: otherValue, isValid: true },
        });

        debouncedUpdateSettings({ [name]: value, [otherName]: otherValue });
      }
    },
    [setForm, debouncedUpdateSettings]
  );

  const onSubmit = useCallback(
    e => {
      e.preventDefault();
      updateExporting(true);
      requestAnimationFrame(async () => {
        await downloadImage();
        updateExporting(false);
      });
    },
    [updateExporting]
  );

  // If the user removes the layer that was used for temporal diffing, then we reset the options
  useEffect(() => {
    if (modeParams.layer && Object.keys(temporalDiffLayers).indexOf(modeParams.layer) === -1) {
      updateModeParams({ ...modeParams, layer: '', map1Date: '', map2Date: '' });
    }
  }, [modeParams, temporalDiffLayers, updateModeParams]);

  return (
    <div className="c-export-tooltip">
      <form onSubmit={onSubmit}>
        <fieldset>
          <legend>Map size</legend>
          <div className="form-row">
            <div className="form-group col-6">
              <label htmlFor="export-width">Width</label>
              <input
                type="number"
                id="export-width"
                name="width"
                className={classnames({ 'form-control': true, 'is-invalid': !form.width.isValid })}
                pattern="\d+"
                value={form.width.value}
                min="150"
                onChange={onChangeWidthOrHeight}
              />
              <div className="invalid-feedback">
                {form.width.value.length === 0 && 'Must be a number.'}
                {form.width.value.length > 0 && 'Minimum value: 150.'}
              </div>
            </div>
            <div className="form-group col-6">
              <label htmlFor="export-height">Height</label>
              <input
                type="number"
                id="export-height"
                name="height"
                className={classnames({ 'form-control': true, 'is-invalid': !form.height.isValid })}
                pattern="\d+"
                min="100"
                value={form.height.value}
                onChange={onChangeWidthOrHeight}
              />
              <div className="invalid-feedback">
                {form.height.value.length === 0 && 'Must be a number.'}
                {form.height.value.length > 0 && 'Minimum value: 100.'}
              </div>
            </div>
          </div>
        </fieldset>
        <fieldset className="mt-3">
          <legend>Grid</legend>
          <div className="form-row">
            <div className="form-group col grid-buttons">
              <input
                type="radio"
                id="export-tooltip-grid-1"
                name="export-tooltip-grid"
                value="1"
                checked={mode === '1'}
                onChange={() => updateMode({ mode: '1', params: {} })}
              />
              <label htmlFor="export-tooltip-grid-1">
                <Icon name="one-map" />
              </label>
              <input
                type="radio"
                id="export-tooltip-grid-2-horizontal"
                name="export-tooltip-grid"
                value="2-horizontal"
                checked={mode === '2-horizontal'}
                onChange={() =>
                  updateMode({
                    mode: '2-horizontal',
                    params: { difference: 'spatial', viewport: modeParams.viewport || undefined },
                  })
                }
              />
              <label htmlFor="export-tooltip-grid-2-horizontal">
                <Icon name="two-maps-horizontal" />
              </label>
              <input
                type="radio"
                id="export-tooltip-grid-2-vertical"
                name="export-tooltip-grid"
                value="2-vertical"
                checked={mode === '2-vertical'}
                onChange={() =>
                  updateMode({
                    mode: '2-vertical',
                    params: { difference: 'spatial', viewport: modeParams.viewport || undefined },
                  })
                }
              />
              <label htmlFor="export-tooltip-grid-2-vertical">
                <Icon name="two-maps-vertical" />
              </label>
            </div>
          </div>
          {(mode === '2-vertical' || mode === '2-horizontal') && (
            <>
              <div className="form-row">
                <div className="form-group col">
                  <label htmlFor="export-difference">Difference</label>
                  <div className="input-group">
                    <Select
                      id="export-difference"
                      value={modeParams.difference}
                      options={[
                        { label: 'Spatial', value: 'spatial' },
                        { label: 'Temporal', value: 'temporal' },
                      ]}
                      onChange={({ value }) =>
                        updateModeParams({
                          ...modeParams,
                          difference: value,
                          ...(value === 'temporal'
                            ? { layer: '', map1Date: '', map2Date: '' }
                            : {}),
                        })
                      }
                    />
                  </div>
                </div>
              </div>
              {modeParams.difference === 'temporal' && (
                <>
                  <div className="form-row">
                    <div className="form-group col">
                      <label htmlFor="export-layer-modify">Layer to modify</label>
                      <div className="input-group">
                        <Select
                          id="export-layer-modify"
                          value={modeParams.layer}
                          options={[
                            { label: 'Select a layer', value: '', disabled: true },
                            ...Object.keys(temporalDiffLayers)
                              .sort((a, b) =>
                                DATA_LAYERS[a].label.localeCompare(DATA_LAYERS[b].label)
                              )
                              .map(layer => ({
                                label: DATA_LAYERS[layer].label,
                                value: layer,
                              })),
                          ]}
                          onChange={({ value }) =>
                            updateModeParams({
                              ...modeParams,
                              layer: value,
                              map1Date: '',
                              map2Date: '',
                            })
                          }
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group col-6">
                      <label htmlFor="export-map-1">Map 1</label>
                      <div className="input-group">
                        <Select
                          id="export-map-1"
                          value={modeParams.map1Date}
                          options={[
                            { label: 'Select a date', value: '', disabled: true },
                            ...(modeParams.layer && temporalDiffLayers[modeParams.layer]
                              ? temporalDiffLayers[modeParams.layer].map(({ label, value }) => ({
                                  label,
                                  value,
                                }))
                              : []),
                          ]}
                          onChange={({ value }) =>
                            updateModeParams({
                              ...modeParams,
                              map1Date: value,
                            })
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="form-group col-6">
                      <label htmlFor="export-map-2">Map 2</label>
                      <div className="input-group">
                        <Select
                          id="export-map-2"
                          value={modeParams.map2Date}
                          options={[
                            { label: 'Select a date', value: '', disabled: true },
                            ...(modeParams.layer && temporalDiffLayers[modeParams.layer]
                              ? temporalDiffLayers[modeParams.layer].map(({ label, value }) => ({
                                  label,
                                  value,
                                }))
                              : []),
                          ]}
                          onChange={({ value }) =>
                            updateModeParams({
                              ...modeParams,
                              map2Date: value,
                            })
                          }
                          required
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </fieldset>
        <button
          type="submit"
          className="btn btn-primary btn-block mt-3"
          disabled={!form.width.isValid || !form.height.isValid}
        >
          Download
        </button>
      </form>
    </div>
  );
};

ExportTooltip.propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  mode: PropTypes.string.isRequired,
  modeParams: PropTypes.object.isRequired,
  temporalDiffLayers: PropTypes.object.isRequired,
  updateSettings: PropTypes.func.isRequired,
  updateExporting: PropTypes.func.isRequired,
  updateMode: PropTypes.func.isRequired,
  updateModeParams: PropTypes.func.isRequired,
};

export default ExportTooltip;
