import React, { useState, useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import debounce from 'lodash/debounce';
import once from 'lodash/once';

import Icon from 'components/icon';
import { Select } from 'components/forms';
import { DATA_LAYERS, BASEMAPS } from 'components/map';
import { downloadImage } from './helper';

import './style.scss';

export const IMAGE_RATIO = 2 / 3;

const ExportTooltip = ({
  width,
  height,
  mode,
  modeParams,
  temporalDiffLayers,
  exporting,
  idle,
  updateSettings,
  updateExporting,
  updateMode,
  updateDifference,
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
  const latestIdle = useRef(idle);

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
        const otherValue = Math.round(name === 'width' ? value * IMAGE_RATIO : value / IMAGE_RATIO);

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
    },
    [updateExporting]
  );

  const initDownload = useCallback(
    // The effect might call initDownload several times so we make sure it is only executed once
    once(async () => {
      await downloadImage();
      updateExporting(false);
    }),
    [
      // exporting is not used in the function but is necessary to reset the “once” counter on each
      // of the exports
      exporting,
      updateExporting,
    ]
  );

  // If the user removes the layer that was used for temporal diffing, then we reset the options
  useEffect(() => {
    if (modeParams.layer && Object.keys(temporalDiffLayers).indexOf(modeParams.layer) === -1) {
      updateModeParams({ ...modeParams, layer: '', map1Date: '', map2Date: '' });
    }
  }, [modeParams, temporalDiffLayers, updateModeParams]);

  // We initiate the download when the map is idle and the exporting flag is set
  useEffect(() => {
    // When the user clicks the download button, at that precise moment, the map is idle but it
    // hasn't resized yet. To avoid executing initDownload at that point, we delay its execution.
    // Unfortunately, idle will still have the value of when the effect was executed so we may still
    // export the image before the map was resized.
    // latestIdle is a ref to idle. By using it instead of idle, we ensure that the function inside
    // setTimeout will see the latest value of idle. This prevents the app from exporting before the
    // map has resized and its tiles have loaded.
    // Learn more about the ref technique here:
    // https://reactjs.org/docs/hooks-faq.html#why-am-i-seeing-stale-props-or-state-inside-my-function
    latestIdle.current = idle;

    // Because the execution of initDownload is delayed in time, initDownload may be called multiple
    // times. initDownload must only consider the first call as relevant.
    setTimeout(() => {
      if (exporting && latestIdle.current.every(i => i)) {
        initDownload();
      }
    }, 100);
  }, [exporting, idle, initDownload]);

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
                onChange={() => updateMode('1')}
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
                onChange={() => updateMode('2-horizontal')}
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
                onChange={() => updateMode('2-vertical')}
              />
              <label htmlFor="export-tooltip-grid-2-vertical">
                <Icon name="two-maps-vertical" />
              </label>
              <input
                type="radio"
                id="export-tooltip-grid-4"
                name="export-tooltip-grid"
                value="4"
                checked={mode === '4'}
                onChange={() => updateMode('4')}
              />
              <label htmlFor="export-tooltip-grid-4">
                <Icon name="four-maps" />
              </label>
              <input
                type="radio"
                id="export-tooltip-grid-animated"
                name="export-tooltip-grid"
                value="animated"
                checked={mode === 'animated'}
                onChange={() => updateMode('animated')}
                disabled
              />
              <label htmlFor="export-tooltip-grid-animated">
                <Icon name="animated-map" />
              </label>
            </div>
          </div>
          {(mode === '2-vertical' || mode === '2-horizontal' || mode === '4') && (
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
                      onChange={({ value }) => updateDifference(value)}
                    />
                  </div>
                </div>
              </div>
              {modeParams.difference === 'temporal' && (
                <>
                  <div className="form-row align-items-end">
                    <div className="form-group col-9">
                      <label htmlFor="export-layer-modify">Layer to modify</label>
                      <div className="input-group">
                        <Select
                          id="export-layer-modify"
                          value={modeParams.layer}
                          options={[
                            { label: 'Select a layer', value: '', disabled: true },
                            ...Object.keys(temporalDiffLayers)
                              .sort((a, b) =>
                                (DATA_LAYERS[a] ?? BASEMAPS[a]).label.localeCompare(
                                  (DATA_LAYERS[b] ?? BASEMAPS[b]).label
                                )
                              )
                              .map(layer => ({
                                label: (DATA_LAYERS[layer] ?? BASEMAPS[layer]).label,
                                value: layer,
                              })),
                          ]}
                          onChange={({ value }) =>
                            updateModeParams({
                              ...modeParams,
                              layer: value,
                              dates: modeParams.dates.map(() => ''),
                            })
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="form-group col-3">
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm"
                        onClick={() =>
                          updateModeParams({
                            ...modeParams,
                            layer: '',
                            dates: modeParams.dates.map(() => ''),
                          })
                        }
                      >
                        Reset all
                      </button>
                    </div>
                  </div>
                  {new Array(modeParams.dates.length / 2).fill(null).map((_, groupIndex) => (
                    <div key={groupIndex} className="form-row">
                      {modeParams.dates.slice(0, 2).map((_2, index) => (
                        <div key={index} className="form-group col-6">
                          <label htmlFor={`export-map-${2 * groupIndex + index + 1}`}>
                            Map {2 * groupIndex + index + 1}
                          </label>
                          <div className="input-group">
                            <Select
                              id={`export-map-${2 * groupIndex + index + 1}`}
                              value={modeParams.dates[2 * groupIndex + index]}
                              options={[
                                { label: 'Select a date', value: '', disabled: true },
                                ...(modeParams.layer && temporalDiffLayers[modeParams.layer]
                                  ? temporalDiffLayers[modeParams.layer].map(
                                      ({ label, value }) => ({
                                        label,
                                        value,
                                      })
                                    )
                                  : []),
                              ]}
                              onChange={({ value }) => {
                                const newDates = [...modeParams.dates];
                                newDates.splice(2 * groupIndex + index, 1, value);

                                updateModeParams({
                                  ...modeParams,
                                  dates: newDates,
                                });
                              }}
                              required
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
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
  exporting: PropTypes.bool.isRequired,
  idle: PropTypes.arrayOf(PropTypes.bool),
  updateSettings: PropTypes.func.isRequired,
  updateExporting: PropTypes.func.isRequired,
  updateMode: PropTypes.func.isRequired,
  updateDifference: PropTypes.func.isRequired,
  updateModeParams: PropTypes.func.isRequired,
};

export default ExportTooltip;
