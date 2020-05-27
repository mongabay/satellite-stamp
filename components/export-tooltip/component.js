import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import debounce from 'lodash/debounce';

import { downloadImage } from './helper';

import './style.scss';

export const IMAGE_RATIO = 2 / 3;

const ExportTooltip = ({ width, height, updateSettings, updateExporting }) => {
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
  updateSettings: PropTypes.func.isRequired,
  updateExporting: PropTypes.func.isRequired,
};

export default ExportTooltip;
