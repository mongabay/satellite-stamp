import parse from 'date-fns/parse';
import format from 'date-fns/format';

export const mapStyle = 'mapbox://styles/mongabay/ckae6rtpe08l81ip77yc44aus/draft';

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
  },
  glad: {
    label: 'Deforestation alerts (GLAD)',
  },
  'tree-cover': {
    label: 'Tree cover',
  },
  'primary-forests': {
    label: 'Primary forests',
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
  },
  population: {
    label: 'Population (grid, 250 m)',
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
