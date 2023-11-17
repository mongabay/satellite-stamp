import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import { Accordion, AccordionItem, AccordionTitle, AccordionPanel } from 'components/accordion';
import Tooltip, { sticky } from 'components/tooltip';
import ExportTooltip from 'components/export-tooltip';
import DownloadSuccessModal from '../download-success-modal';
import DataLayerList from '../data-layer-list';
import ContextualLayerList from '../contextual-layer-list';
import BasemapList from '../basemap-list';

import './style.scss';

const Sidebar = ({ exporting, onClickPresets }) => {
  const [expandedAccordion, setExpandedAccordion] = useState('data-layers');
  const [previousExporting, setPreviousExporting] = useState(false);
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);

  useEffect(() => {
    if (previousExporting !== exporting) {
      if (!exporting) {
        setDownloadModalOpen(true);
      }

      setPreviousExporting(exporting);
    }
  }, [exporting, previousExporting, setDownloadModalOpen, setPreviousExporting]);

  return (
    <aside className="c-tool-sidebar">
      <DownloadSuccessModal open={downloadModalOpen} onClose={() => setDownloadModalOpen(false)} />
      <h1>Satellite Data Tool</h1>
      <p className="c-tool-sidebar__description">
        Create images of maps using various basemaps, contextual and data layers, or explore the map
        presets about topics like conservation.
      </p>
      <Accordion
        multi={false}
        expanded={[expandedAccordion]}
        onChange={uuids => setExpandedAccordion(uuids[0] ?? null)}
      >
        <AccordionItem
          id="data-layers"
          className={expandedAccordion === 'data-layers' ? '-expanded' : null}
        >
          <AccordionTitle aria-level={1}>
            <span className="h1">Data layers</span>
          </AccordionTitle>
          <AccordionPanel>
            <DataLayerList />
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem
          id="contextual-layers"
          className={expandedAccordion === 'contextual-layers' ? '-expanded' : null}
        >
          <AccordionTitle aria-level={1}>
            <span className="h1">Contextual layers</span>
          </AccordionTitle>
          <AccordionPanel>
            <ContextualLayerList />
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem
          id="basemap"
          className={expandedAccordion === 'basemap' ? '-expanded' : null}
        >
          <AccordionTitle aria-level={1}>
            <span className="h1">Basemap</span>
          </AccordionTitle>
          <AccordionPanel>
            <BasemapList />
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
      <div className="mt-4">
        <Tooltip sticky="popper" plugins={[sticky]} content={<ExportTooltip />}>
          <button type="button" className="btn btn-primary mr-2">
            Export
          </button>
        </Tooltip>
        <button type="button" className="btn btn-outline-primary" onClick={onClickPresets}>
          Map presets
        </button>
      </div>
    </aside>
  );
};

Sidebar.propTypes = {
  exporting: PropTypes.bool.isRequired,
  onClickPresets: PropTypes.func.isRequired,
};

export default Sidebar;
