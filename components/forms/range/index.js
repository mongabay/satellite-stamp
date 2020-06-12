import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import './style.scss';

const Range = ({
  id,
  defaultValue,
  value,
  min,
  max,
  step,
  'aria-label': ariaLabel,
  className,
  required,
  disabled,
  marks,
  onChange,
}) => (
  <div className="c-range">
    <input
      type="range"
      id={id}
      className={classnames('custom-range', { [className]: !!className })}
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      step={step}
      aria-label={ariaLabel}
      required={required}
      disabled={disabled}
      onChange={onChange}
    />
    {marks && (
      <div className="marks">
        {marks.map(mark => (
          <span key={mark} data-label={mark} />
        ))}
      </div>
    )}
  </div>
);

Range.propTypes = {
  id: PropTypes.string.isRequired,
  className: PropTypes.string,
  defaultValue: PropTypes.string,
  value: PropTypes.string,
  min: PropTypes.string,
  max: PropTypes.string,
  step: PropTypes.string,
  'aria-label': PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  marks: PropTypes.arrayOf(PropTypes.string),
  onChange: PropTypes.func,
};

Range.defaultProps = {
  className: undefined,
  defaultValue: undefined,
  value: undefined,
  min: undefined,
  max: undefined,
  step: undefined,
  'aria-label': undefined,
  required: false,
  disabled: false,
  marks: undefined,
  onChange: () => null,
};

export default Range;
