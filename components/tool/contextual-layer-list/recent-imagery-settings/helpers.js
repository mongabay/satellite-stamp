/**
 * Get the list of tiles metadata for the current settings
 * @param {{ minDate: string, maxDate: string, cloudCoverage: string, color: string, latitude: number, longitude: number }} param0
 */
const fetchTilesMetadata = async ({
  minDate,
  maxDate,
  cloudCoverage,
  color,
  latitude,
  longitude,
}) => {
  try {
    const { data } = await fetch(
      `https://api.resourcewatch.org/v1/recent-tiles?lat=${latitude}&lon=${longitude}&start=${minDate}&end=${maxDate}&bands=${
        color === '0' ? '' : color
      }`
    ).then(res => res.json());

    return data.tiles
      .map(({ attributes }) => ({
        date: attributes.date_time.split(' ')[0],
        cloudCoverage: Math.ceil(attributes.cloud_score),
        satellite: attributes.instrument === 'LANDSAT_8' ? 'Landsat 8' : attributes.instrument,
        source: attributes.source,
      }))
      .filter(tile => tile.cloudCoverage < cloudCoverage);
  } catch (e) {
    console.error(e);
    return [];
  }
};

/**
 * Return the list thumbnails for the list of tile sources
 * @param {object[]} tiles List of tiles
 * @param {string} color Color of the tiles
 */
const fetchTilesThumbnail = async (tiles, color) => {
  const fetchAndParse = async (startIndex, endIndex) => {
    // /v1/recent-tiles/thumbs
    try {
      const { data } = await fetch(`https://api.resourcewatch.org/v1/recent-tiles/thumbs`, {
        method: 'post',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bands: color === '0' ? '' : color,
          source_data: tiles.map(({ source }) => ({ source })).slice(startIndex, endIndex),
        }),
      }).then(res => res.json());

      return (data?.attributes ?? [])
        .map(({ source, thumbnail_url }) => ({
          source,
          thumbnail: thumbnail_url,
        }))
        .reduce((res, { source, thumbnail }) => ({ ...res, [source]: thumbnail }), {});
    } catch (e) {
      console.error(e);
      return {};
    }
  };

  const TILES_PER_FETCH = 2;

  const fetchCount = Math.ceil(tiles.length / TILES_PER_FETCH);

  let res = {};
  for (let i = 0, j = fetchCount - 1; i < j; i++) {
    res = { ...res, ...(await fetchAndParse(i * TILES_PER_FETCH, (i + 1) * TILES_PER_FETCH)) };
  }

  return res;
};

/**
 * Get the list of tiles for the current settings
 * @param {{ minDate: string, maxDate: string, cloudCoverage: string, color: string, latitude: number, longitude: number }} params
 */
export const fetchTiles = async params => {
  const tiles = await fetchTilesMetadata(params);
  const thumbnails = await fetchTilesThumbnail(tiles, params.color);
  return tiles.map(tile => ({ ...tile, thumbnail: thumbnails[tile.source] }));
};

/**
 * Get the URL of a specific tile
 * @param {string} tileSource Source of the tile
 * @param {string} color Color of the tile
 */
export const fetchTileUrl = async (tileSource, color) => {
  try {
    const { data } = await fetch(`https://api.resourcewatch.org/v1/recent-tiles/tiles`, {
      method: 'post',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bands: color === '0' ? '' : color,
        source_data: [{ source: tileSource }],
      }),
    }).then(res => res.json());

    return data.attributes[0].tile_url;
  } catch (e) {
    console.error(e);
    return null;
  }
};
