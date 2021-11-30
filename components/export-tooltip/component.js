import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import debounce from 'lodash/debounce';
import moment from 'moment';

import Icon from 'components/icon';
import { Select, Checkbox } from 'components/forms';
import { DATA_LAYERS, BASEMAPS } from 'components/map';
import { waitUntil, generateCanvasFrame, downloadImage, downloadAnimatedImage } from './helper';

import './style.scss';

export const IMAGE_RATIO = 2 / 3;

const ExportTooltip = ({
  width,
  height,
  mode,
  modeParams,
  temporalDiffLayers,
  animatedLayerStartDate,
  animatedLayerEndDate,
  exporting,
  idle,
  updateSettings,
  updateExporting,
  updateMode,
  updateDifference,
  updateModeParams,
  updateLayer,
  updateBasemapParams,
  updateProgress,
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

  const [layerUsedInTempDifference, setLayerUsedInTempDifference] = useState('');

  const [animationDuration, setAnimationDuration] = useState(5);
  const [aggregateData, setAggregateData] = useState(false);

  const latestIdle = useRef(idle);
  const previousExporting = useRef(exporting);

  const animationDates = useMemo(() => {
    if (
      modeParams.layers.length < 1 ||
      modeParams.dates[0].length < 2 ||
      !modeParams.dates[0][0] ||
      !modeParams.dates[0][1] ||
      Object.keys(temporalDiffLayers).indexOf(modeParams.layers[0]) === -1
    ) {
      return [];
    }

    return temporalDiffLayers[modeParams.layers[0]]
      .filter(
        option =>
          moment(option.value).isSameOrAfter(moment(modeParams.dates[0][0])) &&
          moment(option.value).isSameOrBefore(moment(modeParams.dates[0][1]))
      )
      .map(option => option.value);
  }, [temporalDiffLayers, modeParams]);

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
      updateProgress(0);
    },
    [updateExporting, updateProgress]
  );

  const initDownload = useCallback(async () => {
    if (mode !== 'animated') {
      await downloadImage();
    } else {
      const frames = [];

      for (const date of animationDates) {
        if (!DATA_LAYERS[modeParams.layers[0]]) {
          // TODO: don't assume the date parameter is the basemap's first param
          const paramName = Object.keys(BASEMAPS[modeParams.layers[0]].params)[0];
          const { dateFormat } = BASEMAPS[modeParams.layers[0]].legend.timeline;

          // TODO: keep the previous params
          updateBasemapParams({
            [paramName]: moment(date).format(dateFormat),
          });
        } else {
          const supportsRanges = DATA_LAYERS[modeParams.layers[0]].legend.timeline?.range !== false;

          updateLayer({
            id: modeParams.layers[0],
            dateRange:
              aggregateData && supportsRanges
                ? [
                    DATA_LAYERS[modeParams.layers[0]].legend.timeline.minDate,
                    DATA_LAYERS[modeParams.layers[0]].legend.timeline.maxDate,
                  ]
                : [date, date],
            currentDate: date,
          });
        }

        // We wait for the layer changes to be taken into account (setTimeout) and then wait for
        // the map to be idle
        await waitUntil(
          () => latestIdle.current.every(i => i),
          // Layers that have a decode function don't trigger an idle event on the map, so here we
          // rely on a greater waiting time
          DATA_LAYERS[modeParams.layers[0]]?.decodeFunction ? 5000 : 100
        );

        frames.push(await generateCanvasFrame());

        updateProgress((animationDates.indexOf(date) + 1) / animationDates.length);
      }

      await downloadAnimatedImage(frames, animationDuration);
    }

    updateExporting(false);
  }, [
    mode,
    animationDates,
    modeParams,
    animationDuration,
    aggregateData,
    updateExporting,
    updateLayer,
    updateBasemapParams,
    updateProgress,
  ]);

  // If the user removes one of the layers that was used for temporal diffing, then we also remove
  // it from the options
  useEffect(() => {
    const layersToRemove = [];
    modeParams.layers.forEach(layer => {
      if (Object.keys(temporalDiffLayers).indexOf(layer) === -1) {
        layersToRemove.push(layer);
      }
    });

    // We only want to call updateModeParams if there are actually layers that have been removed
    if (layersToRemove.length > 0) {
      const newLayers = modeParams.layers.filter(layer => layersToRemove.indexOf(layer) === -1);
      let newDates = [...modeParams.dates];

      layersToRemove.forEach((layer, index) => {
        newDates.splice(index, 1);
      });

      if (newDates.length === 0) {
        // By default dates contain at least one array item that is an array the length of the
        // number of maps
        newDates = [new Array(modeParams.dates[0].length).fill('')];
      }

      updateModeParams({ ...modeParams, layers: newLayers, dates: newDates });

      if (layersToRemove.indexOf(layerUsedInTempDifference) !== -1) {
        setLayerUsedInTempDifference(newLayers?.[0] ?? '');
      }
    }
  }, [
    modeParams,
    temporalDiffLayers,
    layerUsedInTempDifference,
    updateModeParams,
    setLayerUsedInTempDifference,
  ]);

  // If the user removes the layer that was used for the animation, then we reset the animation
  // settings
  useEffect(() => {
    if (mode === 'animated' && modeParams.layers.length > 0) {
      const existsLayer = Object.keys(temporalDiffLayers).indexOf(modeParams.layers[0]) !== -1;
      if (!existsLayer) {
        updateModeParams({
          layers: [],
          dates: [['']],
        });
      }
    }
  }, [mode, modeParams, temporalDiffLayers, updateModeParams]);

  // When the mode is changed, reset the animation's duration and aggregation setting
  useEffect(() => {
    setAnimationDuration(5);
    setAggregateData(false);
  }, [mode, setAnimationDuration, setAggregateData]);

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

    const triggerDownload = async () => {
      await waitUntil(() => latestIdle.current.every(i => i), 100);
      initDownload();
    };

    if (!previousExporting.current && exporting) {
      triggerDownload();
    }

    previousExporting.current = exporting;
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
              />
              <label htmlFor="export-tooltip-grid-animated">
                <Icon name="animated-map" />
              </label>
            </div>
          </div>
          {mode === 'animated' && (
            <>
              <div className="form-row">
                <div className="form-group col">
                  <label htmlFor="export-layer-animate">Layer to animate</label>
                  <div className="input-group">
                    <Select
                      id="export-layer-animate"
                      value={modeParams.layers[0] ?? ''}
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
                          layers: [value],
                          dates: [['']],
                        })
                      }
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group col-6">
                  <label htmlFor="export-start-date">Start date</label>
                  <div className="input-group">
                    <Select
                      id="export-start-date"
                      value={modeParams.dates[0]?.[0] ?? ''}
                      options={[
                        { label: 'Select a date', value: '', disabled: true },
                        ...animatedLayerStartDate,
                      ]}
                      onChange={({ value }) => {
                        let newDates = [...modeParams.dates];

                        newDates[0] = [...newDates[0]];
                        newDates[0].splice(0, 1, value);

                        updateModeParams({
                          ...modeParams,
                          dates: newDates,
                        });
                      }}
                      required
                    />
                  </div>
                </div>
                <div className="form-group col-6">
                  <label htmlFor="export-end-date">End date</label>
                  <div className="input-group">
                    <Select
                      id="export-end-date"
                      value={modeParams.dates[0]?.[1] ?? ''}
                      options={[
                        { label: 'Select a date', value: '', disabled: true },
                        ...animatedLayerEndDate,
                      ]}
                      onChange={({ value }) => {
                        let newDates = [...modeParams.dates];

                        newDates[0] = [...newDates[0]];
                        newDates[0].splice(1, 1, value);

                        updateModeParams({
                          ...modeParams,
                          dates: newDates,
                        });
                      }}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group col">
                  <Checkbox
                    id="export-aggregate"
                    name="export-aggregate"
                    checked={aggregateData}
                    onChange={({ target }) => setAggregateData(target.checked)}
                  >
                    Aggregate data over time
                  </Checkbox>
                  <div className="note">
                    Note this setting is only available to select layers that allow ranges of data
                    to be selected.
                  </div>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group col">
                  <label htmlFor="export-duration">Duration</label>
                  <div className="input-group">
                    <input
                      type="number"
                      id="export-duration"
                      name="width"
                      className="form-control"
                      pattern="\d+"
                      value={animationDuration}
                      min="1"
                      onChange={({ target }) => setAnimationDuration(+target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            </>
          )}
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
                      onChange={({ value }) => {
                        updateDifference(value);
                        setLayerUsedInTempDifference('');
                      }}
                    />
                  </div>
                </div>
              </div>
              {modeParams.difference === 'temporal' && (
                <>
                  <div className="form-row align-items-end">
                    <div className="form-group col-9">
                      <label htmlFor="export-layers-modify">Layers to modify</label>
                      <div className="input-group">
                        <Select
                          id="export-layers-modify"
                          value={layerUsedInTempDifference}
                          options={[
                            { label: 'Select a layer', value: '', disabled: true },
                            ...Object.keys(temporalDiffLayers)
                              .sort((a, b) =>
                                (DATA_LAYERS[a] ?? BASEMAPS[a]).label.localeCompare(
                                  (DATA_LAYERS[b] ?? BASEMAPS[b]).label
                                )
                              )
                              .map(layer => ({
                                label: `${(DATA_LAYERS[layer] ?? BASEMAPS[layer]).label}${
                                  modeParams.layers.indexOf(layer) !== -1 ? ` (in use)` : ''
                                }`,
                                value: layer,
                              })),
                          ]}
                          onChange={({ value }) => setLayerUsedInTempDifference(value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="form-group col-3">
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => {
                          updateModeParams({
                            ...modeParams,
                            layers: [],
                            dates: [modeParams.dates[0].map(() => '')],
                          });
                          setLayerUsedInTempDifference('');
                        }}
                      >
                        Reset all
                      </button>
                    </div>
                  </div>
                  {new Array(modeParams.dates[0].length / 2).fill(null).map((_, groupIndex) => (
                    <div key={groupIndex} className="form-row">
                      {modeParams.dates[0].slice(0, 2).map((_2, index) => (
                        <div key={index} className="form-group col-6">
                          <label htmlFor={`export-map-${2 * groupIndex + index + 1}`}>
                            Map {2 * groupIndex + index + 1}
                          </label>
                          <div className="input-group">
                            <Select
                              id={`export-map-${2 * groupIndex + index + 1}`}
                              value={
                                modeParams.layers.indexOf(layerUsedInTempDifference) !== -1
                                  ? modeParams.dates[
                                      modeParams.layers.findIndex(
                                        layer => layer === layerUsedInTempDifference
                                      )
                                    ][2 * groupIndex + index]
                                  : ''
                              }
                              options={[
                                { label: 'Select a date', value: '', disabled: true },
                                ...(layerUsedInTempDifference &&
                                temporalDiffLayers[layerUsedInTempDifference]
                                  ? temporalDiffLayers[layerUsedInTempDifference].map(
                                      ({ label, value }) => ({
                                        label,
                                        value,
                                      })
                                    )
                                  : []),
                              ]}
                              onChange={({ value }) => {
                                let newLayers = [...modeParams.layers];
                                let newDates = [...modeParams.dates];

                                let layerIndex = modeParams.layers.findIndex(
                                  layer => layer === layerUsedInTempDifference
                                );
                                if (layerIndex === -1) {
                                  layerIndex = newLayers.length;
                                  newLayers.push(layerUsedInTempDifference);

                                  if (modeParams.layers.length > 0) {
                                    newDates.push('');
                                  }
                                }

                                newDates[layerIndex] = [...newDates[layerIndex]];
                                newDates[layerIndex].splice(2 * groupIndex + index, 1, value);

                                updateModeParams({
                                  ...modeParams,
                                  layers: newLayers,
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
  animatedLayerStartDate: PropTypes.array.isRequired,
  animatedLayerEndDate: PropTypes.array.isRequired,
  exporting: PropTypes.bool.isRequired,
  idle: PropTypes.arrayOf(PropTypes.bool),
  updateSettings: PropTypes.func.isRequired,
  updateExporting: PropTypes.func.isRequired,
  updateMode: PropTypes.func.isRequired,
  updateDifference: PropTypes.func.isRequired,
  updateModeParams: PropTypes.func.isRequired,
  updateLayer: PropTypes.func.isRequired,
  updateBasemapParams: PropTypes.func.isRequired,
  updateProgress: PropTypes.func.isRequired,
};

export default ExportTooltip;
