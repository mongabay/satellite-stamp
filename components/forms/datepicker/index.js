import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

const Datepicker = ({
  id,
  defaultValue,
  value,
  min,
  max,
  'aria-label': ariaLabel,
  className,
  required,
  disabled,
  onChange,
}) => (
  <input
    type="date"
    id={id}
    className={classnames('c-datepicker', 'form-control', { [className]: !!className })}
    defaultValue={defaultValue}
    value={value}
    min={min}
    max={max}
    pattern="\d{4}-\d{2}-\d{2}"
    aria-label={ariaLabel}
    required={required}
    disabled={disabled}
    onChange={onChange}
  />
);

Datepicker.propTypes = {
  id: PropTypes.string.isRequired,
  className: PropTypes.string,
  defaultValue: PropTypes.string,
  value: PropTypes.string,
  min: PropTypes.string,
  max: PropTypes.string,
  'aria-label': PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
};

Datepicker.defaultProps = {
  className: undefined,
  defaultValue: undefined,
  value: undefined,
  min: undefined,
  max: undefined,
  'aria-label': undefined,
  required: false,
  disabled: false,
  onChange: () => null,
};

export default Datepicker;
