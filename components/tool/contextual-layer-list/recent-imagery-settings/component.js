import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import debounce from 'lodash/debounce';

import { Checkbox, Radio, Datepicker, Range, Select } from 'components/forms';
import Tooltip from 'components/tooltip';
import { fetchTiles, fetchTileUrl } from './helpers';

import './style.scss';
import LoadingSpinner from 'components/loading-spinner';

const RecentImagerySettings = ({
  viewport,
  recentImagery,
  updateRecentImagery,
  updateViewport,
}) => {
  const [tiles, setTiles] = useState([]);
  const [tilesLoading, setTilesLoading] = useState(false);
  const [previousTileSource, setPreviousTileSource] = useState(recentImagery?.tileSource ?? null);
  const [previousColor, setPreviousColor] = useState(recentImagery?.color ?? null);

  const isToggledOn = recentImagery !== undefined && recentImagery !== null;
  /**
   * @type {(...params: any[]) => Promise<void>}
   */
  const getTiles = useCallback(
    debounce(async ({ minDate, maxDate, cloudCoverage, color, viewport }) => {
      setTilesLoading(true);
      setTiles(
        await fetchTiles({
          minDate,
          maxDate,
          cloudCoverage,
          color,
          ...viewport,
        })
      );
      setTilesLoading(false);
    }, 500),
    [setTilesLoading]
  );

  const onToggle = useCallback(() => {
    updateRecentImagery(
      isToggledOn
        ? null
        : {
            minDate: moment()
              .subtract(3, 'months')
              .format('YYYY-MM-DD'),
            maxDate: moment().format('YYYY-MM-DD'),
            cloudCoverage: '25',
            color: '0',
          }
    );

    if (!isToggledOn && viewport.zoom < 9) {
      updateViewport({ ...viewport, zoom: 9 });
    }
  }, [isToggledOn, viewport, updateRecentImagery, updateViewport]);

  const onSelectTile = useCallback(
    tile =>
      updateRecentImagery({
        ...recentImagery,
        tileSource: tile.source,
        tileInfo: {
          date: tile.date,
          cloudCoverage: tile.cloudCoverage,
          satellite: tile.satellite,
        },
      }),
    [recentImagery, updateRecentImagery]
  );

  // We fetch the tiles info when the layer is toggled on
  useEffect(() => {
    if (
      isToggledOn &&
      ['minDate', 'maxDate', 'cloudCoverage', 'color'].every(
        param =>
          recentImagery[param] !== undefined &&
          recentImagery[param] !== null &&
          recentImagery[param] !== ''
      )
    ) {
      getTiles({
        minDate: recentImagery.minDate,
        maxDate: recentImagery.maxDate,
        cloudCoverage: recentImagery.cloudCoverage,
        color: recentImagery.color,
        viewport,
      });
    }
  }, [
    isToggledOn,
    viewport,
    recentImagery?.minDate,
    recentImagery?.maxDate,
    recentImagery?.cloudCoverage,
    recentImagery?.color,
    getTiles,
  ]);

  // We set a default tile when the tiles info has loaded
  useEffect(() => {
    if (isToggledOn && !tilesLoading && tiles.length > 0 && !recentImagery.tileSource) {
      onSelectTile(tiles[0]);
    }
  }, [isToggledOn, tiles, tilesLoading, recentImagery, onSelectTile]);

  // We fetch the URL of the selected tile
  useEffect(() => {
    const fetchTile = async () => {
      const tileUrl = await fetchTileUrl(recentImagery.tileSource, recentImagery.color);
      updateRecentImagery({ ...recentImagery, tileUrl });
    };

    if (
      isToggledOn &&
      previousTileSource !== recentImagery.tileSource &&
      recentImagery.tileSource
    ) {
      fetchTile();
      setPreviousTileSource(recentImagery.tileSource);
    }

    // We also need to refetch the tile URL if the color change because the tile is defined by the
    // tupple (source, color)
    if (isToggledOn && previousColor !== recentImagery.color) {
      fetchTile();
      setPreviousColor(recentImagery.color);
    }
  }, [
    isToggledOn,
    recentImagery,
    previousTileSource,
    setPreviousTileSource,
    previousColor,
    setPreviousColor,
    updateRecentImagery,
  ]);

  return (
    <div className="c-tool-recent-imagery-settings">
      <div className="group">
        <Checkbox
          id={`contextual-layer-recent-imagery`}
          name="contextual-layer"
          checked={isToggledOn}
          onChange={onToggle}
        >
          Recent satellite imagery
        </Checkbox>
        {isToggledOn && (
          <div className="params">
            <div className="param note">
              Note this layer is only displayed on the single map layout, when non animated.
            </div>
            <div className="param">
              <label htmlFor="contextual-layer-recent-imagery-min-date">
                Acquisition minimum date
              </label>
              <div className="input-group input-group-sm">
                <Datepicker
                  id="contextual-layer-recent-imagery-min-date"
                  min="2013-01-01"
                  max={recentImagery.maxDate || undefined}
                  value={recentImagery.minDate || ''}
                  onChange={({ target }) =>
                    updateRecentImagery({ ...recentImagery, minDate: target.value })
                  }
                />
              </div>
            </div>
            <div className="param">
              <label htmlFor="contextual-layer-recent-imagery-max-date">
                Acquisition maximum date
              </label>
              <div className="input-group input-group-sm">
                <Datepicker
                  id="contextual-layer-recent-imagery-max-date"
                  min={recentImagery.minDate || undefined}
                  max={moment().format('YYYY-MM-DD')}
                  value={recentImagery.maxDate || ''}
                  onChange={({ target }) =>
                    updateRecentImagery({ ...recentImagery, maxDate: target.value })
                  }
                />
              </div>
            </div>
            <div className="param">
              <label htmlFor="contextual-layer-recent-imagery-cloud-coverage">
                Maximum cloud coverage percentage
              </label>
              <div className="input-group input-group-sm">
                <Range
                  id="contextual-layer-recent-imagery-cloud-coverage"
                  min="0"
                  max="100"
                  step="5"
                  value={recentImagery.cloudCoverage || ''}
                  onChange={({ target }) =>
                    updateRecentImagery({ ...recentImagery, cloudCoverage: target.value })
                  }
                  marks={['0%', '25%', '50%', '75%', '100%']}
                />
              </div>
            </div>
            <div className="param">
              <label htmlFor="contextual-layer-recent-imagery-color">Color</label>
              <div className="input-group input-group-sm">
                <Select
                  id="contextual-layer-recent-imagery-color"
                  value={recentImagery.color || ''}
                  options={[
                    { label: 'Choose option', value: '', disabled: true },
                    { label: 'Natural color', value: '0' },
                    { label: 'Vegetation Health', value: '[B8,B11,B2]' },
                  ]}
                  onChange={({ value }) => updateRecentImagery({ ...recentImagery, color: value })}
                />
              </div>
            </div>
            <div className="param">
              <label>Tile {tilesLoading && <LoadingSpinner inline mini />}</label>
              <div className="tiles">
                {tiles.length === 0 &&
                  new Array(4).fill(null).map((_, index) => <div key={index} className="tile" />)}
                {tiles.map(tile => (
                  <div
                    key={tile.source}
                    className="tile"
                    style={{ backgroundImage: `url(${tile.thumbnail})` }}
                  >
                    <Tooltip
                      trigger="mouseenter focus"
                      placement="right"
                      interactive={false}
                      appendTo={() => document.body}
                      popperOptions={{
                        modifiers: {
                          flip: { enabled: false },
                          preventOverflow: { boundariesElement: 'viewport' },
                        },
                      }}
                      content={
                        <div className="c-tool-recent-imagery-settings-tile-tooltip">
                          {tile.date}
                          <br />
                          {`${tile.cloudCoverage}% cloud coverage`}
                          <br />
                          {tile.satellite}
                        </div>
                      }
                    >
                      <Radio
                        id={`contextual-layer-recent-imagery-tile-${tile.source}`}
                        name="contextual-layer-recent-imargery-tile"
                        checked={tile.source === recentImagery.tileSource}
                        onChange={() => onSelectTile(tile)}
                      >
                        <span className="sr-only">
                          Tile from {tile.date} with {tile.cloudCoverage}% cloud coverage from{' '}
                          {tile.satellite}
                        </span>
                      </Radio>
                    </Tooltip>
                    {tile.source === recentImagery.tileSource && <div className="active-border" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

RecentImagerySettings.propTypes = {
  viewport: PropTypes.object.isRequired,
  recentImagery: PropTypes.object,
  updateRecentImagery: PropTypes.func.isRequired,
  updateViewport: PropTypes.func.isRequired,
};

RecentImagerySettings.defaultProps = {
  recentImagery: null,
};

export default RecentImagerySettings;
