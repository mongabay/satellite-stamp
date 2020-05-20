import parse from 'date-fns/parse';
import format from 'date-fns/format';

export const mapStyle = 'mapbox://styles/mongabay/ckae6rtpe08l81ip77yc44aus';

export const ATTRIBUTIONS = {
  rw:
    'Powered by <a href="https://resourcewatch.org/" target="_blank" rel="noopener noreferrer">Resource Watch</a>',
  planet:
    'Basemap by <a href="https://www.planet.com/" target="_blank" rel="noopener noreferrer">Planet</a>',
};

export const BASEMAPS = {
  'mongabay-paper': {
    label: 'Mongabay Paper',
    backgroundColor: '#ffffff',
    minZoom: 0,
    maxZoom: 22,
    styleGroup: 'basemap-paper',
  },
  'mongabay-carbon': {
    label: 'Mongabay Carbon',
    backgroundColor: '#262626',
    minZoom: 0,
    maxZoom: 22,
    styleGroup: 'basemap-carbon',
  },
  landsat: {
    label: 'Landsat',
    image: '/images/basemap-landsat.png',
    backgroundColor: '#020043',
    minZoom: 0,
    maxZoom: 12,
    url: 'https://api.resourcewatch.org/v2/landsat-tiles/{year}/{z}/{x}/{y}',
    params: {
      year: {
        label: 'Year',
        values: [2013, 2014, 2015, 2016, 2017],
        default: 2017,
      },
    },
    attributions: ['rw'],
  },
  planet: {
    label: 'Planet',
    minZoom: 0,
    maxZoom: 18,
    url: ({ key, interval, year, period }) => {
      if (!interval || !year || !period) {
        return null;
      }

      const mosaic =
        interval === 'Monthly'
          ? `global_monthly_${year}_${format(parse(period, 'MMMM', new Date()), 'MM')}_mosaic`
          : `global_quarterly_${year}${period.toLowerCase()}_mosaic`;

      return [
        `https://tiles0.planet.com/basemaps/v1/planet-tiles/${mosaic}/gmap/{z}/{x}/{y}.png?api_key=${key}`,
        `https://tiles1.planet.com/basemaps/v1/planet-tiles/${mosaic}/gmap/{z}/{x}/{y}.png?api_key=${key}`,
        `https://tiles2.planet.com/basemaps/v1/planet-tiles/${mosaic}/gmap/{z}/{x}/{y}.png?api_key=${key}`,
        `https://tiles3.planet.com/basemaps/v1/planet-tiles/${mosaic}/gmap/{z}/{x}/{y}.png?api_key=${key}`,
      ];
    },
    params: {
      key: {
        label: 'API key',
        default: '',
      },
      interval: {
        label: 'Interval',
        values: ['Monthly', 'Quarterly'],
        default: '',
      },
      year: {
        label: 'Year',
        values: [],
        default: '',
      },
      period: {
        label: 'Period',
        values: [],
        default: '',
      },
    },
    attributions: ['planet'],
  },
};

export const CONTEXTUAL_LAYERS = {
  'labels-light': {
    label: 'Labels light',
    minZoom: 1,
    maxZoom: 22,
    styleGroup: 'contextual-labels-light',
  },
  'labels-dark': {
    label: 'Labels dark',
    minZoom: 1,
    maxZoom: 22,
    styleGroup: 'contextual-labels-dark',
  },
  'admin-boundaries': {
    label: 'Admin boundaries',
    minZoom: 1,
    maxZoom: 22,
    styleGroup: 'contextual-boundaries',
  },
  roads: {
    label: 'Roads',
    minZoom: 5,
    maxZoom: 22,
    styleGroup: 'contextual-roads',
  },
  hillshade: {
    label: 'Hillshade',
    minZoom: 0,
    maxZoom: 22,
    styleGroup: 'contextual-hillshade',
  },
  water: {
    label: 'Water',
    minZoom: 0,
    maxZoom: 22,
    styleGroup: 'contextual-water',
  },
};

export const DATA_LAYERS = {
  'tree-cover-loss': {
    label: 'Tree cover loss',
    attributions: ['rw'],
    config: {
      type: 'raster',
      source: {
        tiles: [
          'https://storage.googleapis.com/wri-public/Hansen18/tiles/hansen_world/v1/tc30/{z}/{x}/{y}.png',
        ],
        minzoom: 2,
        maxzoom: 12,
      },
    },
    legend: {
      type: 'basic',
      items: [
        {
          name: 'Tree cover loss',
          color: '#dc6c9a',
        },
      ],
      timeline: {
        step: 1,
        speed: 250,
        interval: 'years',
        dateFormat: 'YYYY',
        minDate: '2001-01-01',
        maxDate: '2018-12-31',
        canPlay: true,
      },
    },
    decodeParams: {
      startYear: 2001,
      endYear: 2018,
    },
    decodeConfig: [
      {
        default: '2001-01-01',
        key: 'startDate',
        required: true,
      },
      {
        default: '2018-12-31',
        key: 'endDate',
        required: true,
      },
    ],
    decodeFunction: `
      // values for creating power scale, domain (input), and range (output)
      float domainMin = 0.;
      float domainMax = 255.;
      float rangeMin = 0.;
      float rangeMax = 255.;
      float exponent = zoom < 13. ? 0.3 + (zoom - 3.) / 20. : 1.;
      float intensity = color.r * 255.;
      // get the min, max, and current values on the power scale
      float minPow = pow(domainMin, exponent - domainMin);
      float maxPow = pow(domainMax, exponent);
      float currentPow = pow(intensity, exponent);
      // get intensity value mapped to range
      float scaleIntensity = ((currentPow - minPow) / (maxPow - minPow) * (rangeMax - rangeMin)) + rangeMin;
      // a value between 0 and 255
      alpha = zoom < 13. ? scaleIntensity / 255. : color.g;
      float year = 2000.0 + (color.b * 255.);
      // map to years
      if (year >= startYear && year <= endYear && year >= 2001.) {
        color.r = 220. / 255.;
        color.g = (72. - zoom + 102. - 3. * scaleIntensity / zoom) / 255.;
        color.b = (33. - zoom + 153. - intensity / zoom) / 255.;
      } else {
        alpha = 0.;
      }
    `,
  },
  glad: {
    label: 'Deforestation alerts (GLAD)',
    attributions: ['rw'],
    config: {
      type: 'raster',
      source: {
        tiles: ['https://tiles.globalforestwatch.org/glad_prod/tiles/{z}/{x}/{y}.png'],
        minzoom: 2,
        maxzoom: 12,
      },
    },
    legend: {
      type: 'basic',
      items: [
        {
          color: '#dc6699',
          name: 'GLAD alerts',
        },
        {
          color: '#e4c600',
          name: 'Recent alerts',
        },
      ],
      timeline: {
        step: 7,
        speed: 100,
        interval: 'days',
        dateFormat: 'YYYY-MM-DD',
        minDate: '2015-01-01',
        maxDate: '2020-05-15',
        canPlay: true,
      },
    },
    decodeParams: {
      numberOfDays: 1961,
      startDayIndex: 0,
      endDayIndex: 1961,
    },
    decodeFunction: `
      // values for creating power scale, domain (input), and range (output)
      float confidenceValue = 0.;
      float confirmedOnly = 1.;
      if (confirmedOnly > 0.) {
        confidenceValue = 200.;
      }
      float day = color.r * 255. * 255. + (color.g * 255.);
      float confidence = color.b * 255.;
      if (
        day > 0. &&
        day >= startDayIndex &&
        day <= endDayIndex &&
        confidence >= confidenceValue
      ) {
        // get intensity
        float intensity = mod(confidence, 100.) * 50.;
        if (intensity > 255.) {
          intensity = 255.;
        }
        if (day >= numberOfDays - 7. && day <= numberOfDays) {
          color.r = 219. / 255.;
          color.g = 168. / 255.;
          color.b = 0.;
          alpha = intensity / 255.;
        } else {
          color.r = 220. / 255.;
          color.g = 102. / 255.;
          color.b = 153. / 255.;
          alpha = intensity / 255.;
        }
      } else {
        alpha = 0.;
      }
    `,
  },
  'tree-cover': {
    label: 'Tree cover',
    attributions: ['rw'],
    config: {
      type: 'raster',
      source: (year = 2010) => {
        const yearToTiles = {
          2000: 'https://earthengine.google.org/static/hansen_2014/gfw_loss_tree_year_30_2014/{z}/{x}/{y}.png',
          2010: 'https://storage.googleapis.com/wri-public/treecover/2010/30/{z}/{x}/{y}.png',
        };

        return {
          tiles: [yearToTiles[year]],
          minzoom: 2,
          maxzoom: 12,
        };
      },
    },
    legend: {
      type: 'basic',
      items: [
        {
          name: 'Tree cover',
          color: '#97BD3D',
        },
      ],
      timeline: {
        step: null,
        range: false,
        interval: 'years',
        dateFormat: 'YYYY',
        minDate: '2000-01-01',
        maxDate: '2010-01-01',
        marks: {
          0: '2000',
          10: '2010',
        },
      },
    },
    decodeParams: {},
    decodeFunction: `
      // values for creating power scale, domain (input), and range (output)
      float domainMin = 0.;
      float domainMax = 255.;
      float rangeMin = 0.;
      float rangeMax = 255.;
      float exponent = zoom < 13. ? 0.3 + (zoom - 3.) / 20. : 1.;
      float intensity = color.g * 255.;
      // get the min, max, and current values on the power scale
      float minPow = pow(domainMin, exponent - domainMin);
      float maxPow = pow(domainMax, exponent);
      float currentPow = pow(intensity, exponent);
      // get intensity value mapped to range
      float scaleIntensity = ((currentPow - minPow) / (maxPow - minPow) * (rangeMax - rangeMin)) + rangeMin;
      // a value between 0 and 255
      alpha = zoom < 13. ? scaleIntensity * 0.8 / 255. : color.g * 0.8;
      color.r = 151. / 255.;
      color.g = 189. / 255.;
      color.b = 61. / 255.;
  `,
  },
  'primary-forests': {
    label: 'Primary forests',
    attributions: ['rw'],
    config: {
      type: 'raster',
      source: {
        tiles: [
          'https://api.resourcewatch.org/v1/layer/41086554-5ca5-456c-80dd-f6bee61bc45f/tile/gee/{z}/{x}/{y}',
        ],
        minzoom: 3,
        maxzoom: 12,
      },
    },
    legend: {
      type: 'basic',
      items: [
        {
          color: '#658434',
          name: 'Primary forest',
        },
      ],
    },
  },
  'south-america-tree-cover-height': {
    label: 'South America tree cover height',
  },
  'land-cover': {
    label: 'Global land cover',
  },
  'tree-plantations': {
    label: 'Tree plantations',
  },
  'protected-areas': {
    label: 'Protected areas',
  },
  'urban-built-up-area': {
    label: 'Urban built-up Area',
    attributions: ['rw'],
    config: {
      type: 'raster',
      source: {
        tiles: [
          'https://api.resourcewatch.org/v1/layer/a4055dea-8762-4c2d-b7ba-a3e616a97b41/tile/gee/{z}/{x}/{y}',
        ],
        minzoom: 2,
        maxzoom: 12,
      },
    },
    legend: {
      type: 'choropleth',
      items: [
        {
          name: '<1975',
          color: '#ff0000',
          id: 0,
        },
        {
          name: '1975-1990',
          color: '#ff7f00',
          id: 1,
        },
        {
          name: '1990-2000',
          color: '#ffff00',
          id: 2,
        },
        {
          name: '2000-2014',
          color: '#f7f7f7',
          id: 3,
        },
      ],
    },
  },
  population: {
    label: 'Population (grid, 250 m)',
    attributions: ['rw'],
    config: {
      type: 'raster',
      source: (year = 2015) => {
        const yearToTiles = {
          1975: 'https://api.resourcewatch.org/v1/layer/94946f97-a7b6-4ded-be7b-7bae63e3b892/tile/gee/{z}/{x}/{y}',
          1990: 'https://api.resourcewatch.org/v1/layer/24a8a270-bd69-4c99-bfdc-84c59ccbfaf9/tile/gee/{z}/{x}/{y}',
          2000: 'https://api.resourcewatch.org/v1/layer/3e3534ae-6052-4dd8-9fe9-19066aa18826/tile/gee/{z}/{x}/{y}',
          2015: 'https://api.resourcewatch.org/v1/layer/2b44782c-1f20-4868-9400-c3819f49ccc8/tile/gee/{z}/{x}/{y}',
        };

        return {
          tiles: [yearToTiles[year]],
          minzoom: 2,
          maxzoom: 12,
        };
      },
    },
    legend: {
      type: 'choropleth',
      items: [
        {
          color: '#32095D',
          name: '≤25',
          id: 0,
        },
        {
          color: '#781C6D',
          name: '≤100',
          id: 1,
        },
        {
          color: '#BA3655',
          name: '≤1k',
          id: 2,
        },
        {
          color: '#ED6825',
          name: '≤5k',
          id: 3,
        },
        {
          color: '#FBB318',
          name: '≤10k',
          id: 4,
        },
        {
          color: '#FCFEA4',
          name: '>10k',
          id: 5,
        },
      ],
      timeline: {
        step: null,
        range: false,
        interval: 'years',
        dateFormat: 'YYYY',
        minDate: '1975-01-01',
        maxDate: '2015-01-01',
        marks: {
          0: '1975',
          15: '',
          25: '',
          40: '2015',
        },
      },
    },
  },
  'population-density': {
    label: 'Population density (grid, 1 km)',
  },
  roads: {
    label: 'Roads',
  },
  'logging-concessions': {
    label: 'Logging concessions',
  },
  'mining-concessions': {
    label: 'Mining concessions',
  },
  'oil-palm-concessions': {
    label: 'Oil palm concessions',
  },
  'wood-fiber-concessions': {
    label: 'Wood fiber concessions by type',
  },
  'palm-oil-mills': {
    label: 'Palm oil mills',
  },
  'indigenous-territories': {
    label: 'Indigenous territories',
  },
  mangroves: {
    label: 'Mangroves',
  },
  peatlands: {
    label: 'Peatlands',
  },
  'intact-forest-landscapes': {
    label: 'Intact Forest Landscapes',
  },
};

export const PRESETS = {
  'tree-cover-loss': {
    label: 'Tree cover loss',
    layers: [
      {
        id: 'tree-cover-loss',
      },
      {
        id: 'tree-cover',
      },
      {
        id: 'primary-forests',
      },
      {
        id: 'south-america-tree-cover-height',
      },
    ],
  },
  'forest-alerts': {
    label: 'Forest alerts',
    layers: [
      {
        id: 'glad',
      },
      {
        id: 'tree-cover',
      },
      {
        id: 'primary-forests',
      },
    ],
  },
  'land-cover-verification': {
    label: 'Land cover verification',
    layers: [
      {
        id: 'tree-cover',
      },
      {
        id: 'primary-forests',
      },
      {
        id: 'south-america-tree-cover-height',
      },
      {
        id: 'land-cover',
      },
      {
        id: 'tree-plantations',
      },
      {
        id: 'protected-areas',
      },
      {
        id: 'urban-built-up-area',
      },
      {
        id: 'mangroves',
      },
      {
        id: 'peatlands',
      },
      {
        id: 'intact-forest-landscapes',
      },
    ],
  },
  biodiversity: {
    label: 'Biodiversity',
    layers: [
      {
        id: 'land-cover',
      },
      {
        id: 'tree-plantations',
      },
      {
        id: 'protected-areas',
      },
      {
        id: 'urban-built-up-area',
      },
      {
        id: 'roads',
      },
      {
        id: 'mangroves',
      },
      {
        id: 'peatlands',
      },
      {
        id: 'intact-forest-landscapes',
      },
    ],
  },
  industry: {
    label: 'Industry',
    layers: [
      {
        id: 'tree-plantations',
      },
      {
        id: 'logging-concessions',
      },
      {
        id: 'mining-concessions',
      },
      {
        id: 'oil-palm-concessions',
      },
      {
        id: 'wood-fiber-concessions',
      },
      {
        id: 'palm-oil-mills',
      },
    ],
  },
  infrastructure: {
    label: 'Infrastructure',
    layers: [
      {
        id: 'urban-built-up-area',
      },
      {
        id: 'population',
      },
      {
        id: 'population-density',
      },
      {
        id: 'roads',
      },
    ],
  },
};
