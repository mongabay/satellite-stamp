import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { DATA_LAYERS } from 'components/map';
import { Checkbox } from 'components/forms';
import { Accordion, AccordionItem, AccordionTitle, AccordionPanel } from 'components/accordion';
import Tooltip, { sticky } from 'components/tooltip';
import ExportTooltip from 'components/export-tooltip';
import ContextualLayerList from '../contextual-layer-list';
import BasemapList from '../basemap-list';

import './style.scss';

const Sidebar = ({ activeLayers, addLayer, removeLayer, onClickPresets }) => {
  const [expandedAccordion, setExpandedAccordion] = useState('data-layers');

  return (
    <aside className="c-tool-sidebar">
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
            <div className="pt-2">
              {Object.keys(DATA_LAYERS)
                .sort((a, b) => DATA_LAYERS[a].label.localeCompare(DATA_LAYERS[b].label))
                .map(key => (
                  <Checkbox
                    key={key}
                    id={`data-layers-${key}`}
                    name="data-layers"
                    checked={activeLayers.indexOf(key) !== -1}
                    onChange={() => {
                      if (activeLayers.indexOf(key) !== -1) {
                        removeLayer(key);
                      } else {
                        addLayer(key);
                      }
                    }}
                  >
                    {DATA_LAYERS[key].label}
                  </Checkbox>
                ))}
            </div>
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
  activeLayers: PropTypes.arrayOf(PropTypes.string).isRequired,
  addLayer: PropTypes.func.isRequired,
  removeLayer: PropTypes.func.isRequired,
  onClickPresets: PropTypes.func.isRequired,
};

export default Sidebar;
