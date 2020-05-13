export const mapStyle = 'mapbox://styles/mongabay/ck8rmdfel02iw1ipc3i6ugtpb';

export const BASEMAPS = {
  'mongabay-paper': {
    label: 'Mongabay Paper',
    backgroundColor: '#ffffff',
    minZoom: 0,
    maxZoom: 22,
    styleGroup: 'basemap-paper',
  },
  landsat: {
    label: 'Landsat',
  },
  planet: {
    label: 'Planet',
  },
};

export const CONTEXTUAL_LAYERS = {
  labels: {
    label: 'Labels',
    minZoom: 1,
    maxZoom: 22,
    styleGroup: 'contextual-labels',
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
  'elevation-lines': {
    label: 'Elevation lines',
    minZoom: 11,
    maxZoom: 22,
    styleGroup: 'contextual-elevation',
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
  'forest-canopy-height': {
    label: 'Global forest canopy height',
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
};
