import React, { useState } from 'react';

import StaticPage from 'layout/static-page';
import { Accordion, AccordionItem, AccordionTitle, AccordionPanel } from 'components/accordion';
import { Checkbox, Radio } from 'components/forms';
import { BASEMAPS, CONTEXTUAL_LAYERS, DATA_LAYERS } from 'components/map/constants';

import './style.scss';

const HomePage = () => {
  const [expandedAccordion, setExpandedAccordion] = useState('data-layers');

  return (
    <StaticPage className="p-home">
      <aside>
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
                      checked={false}
                      onChange={console.log}
                      disabled
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
              <div className="pt-2">
                {Object.keys(CONTEXTUAL_LAYERS)
                  .sort((a, b) =>
                    CONTEXTUAL_LAYERS[a].label.localeCompare(CONTEXTUAL_LAYERS[b].label)
                  )
                  .map(key => (
                    <Checkbox
                      key={key}
                      id={`contextual-layers-${key}`}
                      name="contextual-layers"
                      checked={false}
                      onChange={console.log}
                      disabled
                    >
                      {CONTEXTUAL_LAYERS[key].label}
                    </Checkbox>
                  ))}
              </div>
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
              <div className="pt-2">
                {Object.keys(BASEMAPS)
                  .sort((a, b) => BASEMAPS[a].label.localeCompare(BASEMAPS[b].label))
                  .map(key => (
                    <Radio
                      key={key}
                      id={`basemap-${key}`}
                      name="basemap"
                      checked={false}
                      onChange={console.log}
                      disabled
                    >
                      {BASEMAPS[key].label}
                    </Radio>
                  ))}
              </div>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
        <div className="mt-4">
          <button type="button" className="btn btn-primary mr-2" disabled>
            Export
          </button>
          <button type="button" className="btn btn-outline-primary" disabled>
            Map presets
          </button>
        </div>
      </aside>
      <div className="visualization" />
    </StaticPage>
  );
};

export default HomePage;
