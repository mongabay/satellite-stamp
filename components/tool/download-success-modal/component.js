import React from 'react';
import PropTypes from 'prop-types';

import Modal from 'components/modal';

import './style.scss';

const ToolDownloadSuccessModal = ({ open, onClose }) => {
  return (
    <Modal title="Map downloaded" open={open} onClose={onClose} className="c-tool-planet-modal">
      <h1 className="mb-3">Map downloaded!</h1>
      <p>
        Check the{' '}
        <a
          href="https://mongabay.github.io/visual-style-guide/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Mongabay Style Guidelines
        </a>{' '}
        in case you need to add any further detail on your map.
      </p>
      <button type="button" className="btn btn-primary btn-block mt-4" onClick={onClose}>
        Close
      </button>
    </Modal>
  );
};

ToolDownloadSuccessModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ToolDownloadSuccessModal;
