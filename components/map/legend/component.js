import React from 'react';
import PropTypes from 'prop-types';
import {
  Legend as VizzLegend,
  LegendListItem,
  LegendItemToolbar,
  LegendItemButtonOpacity,
  LegendItemTypes,
  LegendItemTimeStep,
} from 'vizzuality-components';
import classnames from 'classnames';

import Icon from 'components/icon';
import { Accordion, AccordionItem, AccordionTitle, AccordionPanel } from 'components/accordion';
import { Datepicker } from 'components/forms';
import { getLayerWithFilteredLegendItems } from './helpers';
import Title from './title';

import './style.scss';

const Legend = ({
  exporting,
  layers,
  onClickToggleVisibility,
  onChangeOpacity,
  onClickRemove,
  onChangeDate,
  onChangeLayersOrder,
}) => (
  <div className={classnames({ 'c-map-legend': true, '-exporting': exporting })}>
    <VizzLegend
      // The key forces the legend to re-render when switching between editing and exporting
      // This makes sure the legend is always expanded when exporting
      key={exporting}
      sortable={!exporting}
      expanded
      maxHeight={420}
      onChangeOrder={layers => onChangeLayersOrder(layers.reverse())}
    >
      {layers
        .filter(layer => !exporting || layer.visibility)
        .map(layer => (
          <LegendListItem
            key={layer.id}
            layerGroup={layer}
            disabled={layer.readonly}
            title={<Title exporting={exporting} layerGroup={layer} />}
            toolbar={
              <LegendItemToolbar
                onChangeOpacity={(_, opacity) => onChangeOpacity(layer.id, opacity)}
              >
                {!exporting && !layer.readonly && <LegendItemButtonOpacity />}
                {!exporting && !layer.readonly && (
                  <button
                    type="button"
                    className="btn"
                    onClick={() => onClickToggleVisibility(layer.id, !layer.visibility)}
                  >
                    <Icon name={layer.visibility ? 'eye' : 'slashed-eye'} />
                  </button>
                )}
                {!exporting && !layer.readonly && (
                  <button type="button" className="btn" onClick={() => onClickRemove(layer.id)}>
                    <Icon name="close" />
                  </button>
                )}
              </LegendItemToolbar>
            }
          >
            {layer.layers[0].legendConfig.type !== 'group' && <LegendItemTypes />}
            {layer.layers[0].legendConfig.type === 'group' && (
              <div className="c-legend-type-group">
                <Accordion>
                  {layer.layers[0].legendConfig.items.map(group => (
                    <AccordionItem key={group.name} id={group.name}>
                      <AccordionTitle aria-level={4}>
                        <div className="group-color" style={{ backgroundColor: group.color }} />
                        {group.name}
                      </AccordionTitle>
                      <AccordionPanel>
                        <LegendItemTypes
                          activeLayer={getLayerWithFilteredLegendItems(layer.layers[0], group.name)}
                        />
                      </AccordionPanel>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}
            {!exporting && (
              <LegendItemTimeStep handleChange={dates => onChangeDate(layer.id, dates)} />
            )}
            {!exporting &&
              layer.layers[0].legendConfig.timeline?.range !== false &&
              // The native datepickers only support the combination day, month and year
              // Layers that use other intervals are also less likely to need separate for precision
              layer.layers[0].legendConfig.timeline?.interval === 'days' && (
                <div className="timestep-controls">
                  <div>
                    <label htmlFor={`legend-${layer.id}-from`}>From</label>
                    <div className="input-group input-group-sm">
                      {console.log(layer.layers[0])}
                      <Datepicker
                        id={`legend-${layer.id}-from`}
                        min={layer.layers[0].legendConfig.timeline.minDate}
                        max={layer.layers[0].timelineParams?.trimEndDate || undefined}
                        value={layer.layers[0].timelineParams?.startDate || ''}
                        onChange={({ target }) =>
                          onChangeDate(layer.id, [
                            target.value,
                            layer.layers[0].timelineParams?.trimEndDate,
                            layer.layers[0].timelineParams?.trimEndDate,
                          ])
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor={`legend-${layer.id}-from`}>To</label>
                    <div className="input-group input-group-sm">
                      <Datepicker
                        id={`legend-${layer.id}-from`}
                        min={layer.layers[0].timelineParams?.startDate}
                        max={layer.layers[0].legendConfig.timeline.maxDate || undefined}
                        value={layer.layers[0].timelineParams?.trimEndDate || ''}
                        onChange={({ target }) =>
                          onChangeDate(layer.id, [
                            layer.layers[0].timelineParams?.startDate,
                            target.value,
                            target.value,
                          ])
                        }
                      />
                    </div>
                  </div>
                </div>
              )}
          </LegendListItem>
        ))}
    </VizzLegend>
  </div>
);

Legend.propTypes = {
  exporting: PropTypes.bool,
  layers: PropTypes.arrayOf(PropTypes.object).isRequired,
  onChangeOpacity: PropTypes.func.isRequired,
  onClickToggleVisibility: PropTypes.func.isRequired,
  onClickRemove: PropTypes.func.isRequired,
  onChangeDate: PropTypes.func.isRequired,
  onChangeLayersOrder: PropTypes.func.isRequired,
};

Legend.defaultProps = {
  exporting: false,
};

export default Legend;
