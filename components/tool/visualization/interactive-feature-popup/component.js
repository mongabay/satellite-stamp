import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import Icon from 'components/icon';
import { Popup } from 'components/map';

import './style.scss';

const VisualizationInteractiveFeaturePopup = ({ lat, lng, properties, onClose }) => (
  <Popup
    latitude={lat}
    longitude={lng}
    dynamicPosition={false}
    closeButton={false}
    onClose={onClose}
  >
    <div className="c-visualization-interactive-feature-popup">
      <button type="button" className="btn btn-outline-primary close-button" onClick={onClose}>
        <Icon name="close" />
      </button>
      {Object.keys(properties).map((key, index) => (
        <div key={key} className={classnames({ row: true, 'mt-2': index > 0 })}>
          <div className="col-5 label">{key}</div>
          <div className="col-7 value">{properties[key] || '−'}</div>
        </div>
      ))}
    </div>
  </Popup>
);

VisualizationInteractiveFeaturePopup.propTypes = {
  lat: PropTypes.number.isRequired,
  lng: PropTypes.number.isRequired,
  properties: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default VisualizationInteractiveFeaturePopup;
