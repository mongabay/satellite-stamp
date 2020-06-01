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
