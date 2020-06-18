import moment from 'moment';

export const mapStyle = 'mapbox://styles/mongabay/ckae6rtpe08l81ip77yc44aus';

export const VECTOR_LAYERS_FILL_OPACITY = 0.3;

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
          ? `global_monthly_${year}_${moment(period, 'MMMM').format('MM')}_mosaic`
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
  'labels-none': {
    label: 'No labels',
    group: 'labels',
  },
  'labels-light': {
    label: 'Labels light',
    minZoom: 1,
    maxZoom: 22,
    group: 'labels',
    styleGroup: 'contextual-labels-light',
  },
  'labels-dark': {
    label: 'Labels dark',
    minZoom: 1,
    maxZoom: 22,
    group: 'labels',
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
    attributions: ['rw'],
    config: {
      type: 'raster',
      source: (year = 2016) => {
        const yearToTiles = {
          1985: 'https://api.resourcewatch.org/v1/layer/d6e82875-6d96-45ef-855c-86ed26fba84b/tile/gee/{z}/{x}/{y}',
          1986: 'https://api.resourcewatch.org/v1/layer/e96ed299-9bf1-40c5-8ce1-07cb72d9cb32/tile/gee/{z}/{x}/{y}',
          1987: 'https://api.resourcewatch.org/v1/layer/5cc99490-fb5a-4d7c-949f-a78a798a98c6/tile/gee/{z}/{x}/{y}',
          1988: 'https://api.resourcewatch.org/v1/layer/165ecb67-efef-4e0f-9232-a0ce7b52b086/tile/gee/{z}/{x}/{y}',
          1989: 'https://api.resourcewatch.org/v1/layer/b125c1ef-4e2b-4fe9-984e-a71158d57efd/tile/gee/{z}/{x}/{y}',
          1990: 'https://api.resourcewatch.org/v1/layer/3c930dc1-3e23-41a0-af4e-ebdbfdd938bc/tile/gee/{z}/{x}/{y}',
          1991: 'https://api.resourcewatch.org/v1/layer/0edc0ba1-7069-4953-ba5f-f4883f63dee9/tile/gee/{z}/{x}/{y}',
          1992: 'https://api.resourcewatch.org/v1/layer/6612ac38-fa4c-4fdc-8cfc-a6bd1cdcc67f/tile/gee/{z}/{x}/{y}',
          1993: 'https://api.resourcewatch.org/v1/layer/21480a77-38b6-4f9b-95a8-c91ffc70171d/tile/gee/{z}/{x}/{y}',
          1994: 'https://api.resourcewatch.org/v1/layer/ec250df8-5c99-4eb6-af5c-c0e4129ba2dd/tile/gee/{z}/{x}/{y}',
          1995: 'https://api.resourcewatch.org/v1/layer/47106136-954d-491b-abea-e6b4135b7c61/tile/gee/{z}/{x}/{y}',
          1996: 'https://api.resourcewatch.org/v1/layer/5cec19be-7706-4724-9879-1e88611729c6/tile/gee/{z}/{x}/{y}',
          1997: 'https://api.resourcewatch.org/v1/layer/a7a83b7d-488a-4e3f-833a-4f9aad1e25f7/tile/gee/{z}/{x}/{y}',
          1998: 'https://api.resourcewatch.org/v1/layer/cee53792-c2d4-4c0d-9f80-e17b0dfede7d/tile/gee/{z}/{x}/{y}',
          1999: 'https://api.resourcewatch.org/v1/layer/3a7e8216-477f-4d57-8219-ff1051347b46/tile/gee/{z}/{x}/{y}',
          2000: 'https://api.resourcewatch.org/v1/layer/5652e2b6-98d6-450d-a94d-7a07e64f79e1/tile/gee/{z}/{x}/{y}',
          2001: 'https://api.resourcewatch.org/v1/layer/c47dd032-d931-47ca-b1b7-76311859582e/tile/gee/{z}/{x}/{y}',
          2002: 'https://api.resourcewatch.org/v1/layer/7924e778-94a6-447a-bdc4-0611424c5f6c/tile/gee/{z}/{x}/{y}',
          2003: 'https://api.resourcewatch.org/v1/layer/c480cd87-15fc-4b86-b423-62fff569201f/tile/gee/{z}/{x}/{y}',
          2004: 'https://api.resourcewatch.org/v1/layer/bd5b3876-5cb1-4511-ab51-4ae183be2de4/tile/gee/{z}/{x}/{y}',
          2005: 'https://api.resourcewatch.org/v1/layer/19c3d1c9-a55e-4c3f-996d-63eaacd5381e/tile/gee/{z}/{x}/{y}',
          2006: 'https://api.resourcewatch.org/v1/layer/57c121a4-67e0-44e3-a68e-ca36bee33652/tile/gee/{z}/{x}/{y}',
          2007: 'https://api.resourcewatch.org/v1/layer/a257bce9-ccdb-4c31-aeff-cb400147d661/tile/gee/{z}/{x}/{y}',
          2008: 'https://api.resourcewatch.org/v1/layer/88090586-6722-4015-aeff-9f5671fe9736/tile/gee/{z}/{x}/{y}',
          2009: 'https://api.resourcewatch.org/v1/layer/0c85320c-5e40-473b-b406-7d14ca0056f6/tile/gee/{z}/{x}/{y}',
          2010: 'https://api.resourcewatch.org/v1/layer/61f51abe-4ada-44e5-bb34-c23b400fbcb9/tile/gee/{z}/{x}/{y}',
          2011: 'https://api.resourcewatch.org/v1/layer/997080b8-df9b-48b0-8549-2185dee669a0/tile/gee/{z}/{x}/{y}',
          2012: 'https://api.resourcewatch.org/v1/layer/a0468978-50c3-4161-bc2a-b5de6897e16e/tile/gee/{z}/{x}/{y}',
          2013: 'https://api.resourcewatch.org/v1/layer/fe86437b-fbaa-4692-b2e4-601b87edcef6/tile/gee/{z}/{x}/{y}',
          2014: 'https://api.resourcewatch.org/v1/layer/82fb6725-c937-411c-9703-67cdf3f08439/tile/gee/{z}/{x}/{y}',
          2015: 'https://api.resourcewatch.org/v1/layer/137f4d65-60f9-41b3-bac4-f0a911dd7d3b/tile/gee/{z}/{x}/{y}',
          2016: 'https://api.resourcewatch.org/v1/layer/f718e2ab-ee37-4af2-b6b4-e052ed4d15dd/tile/gee/{z}/{x}/{y}',
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
          name: '≤5',
          color: '#f0f9e8',
        },
        {
          name: '≤10',
          color: '#bae4bc',
        },
        {
          name: '≤15',
          color: '#7bccc4',
        },
        {
          name: '≤20',
          color: '#43a2ca',
        },
        {
          name: '>20',
          color: '#0868ac',
        },
      ],
      timeline: {
        step: 1,
        range: false,
        interval: 'years',
        dateFormat: 'YYYY',
        minDate: '1985-01-01',
        maxDate: '2016-01-01',
      },
    },
  },
  'land-cover': {
    label: 'Global land cover',
    attributions: ['rw'],
    config: {
      type: 'raster',
      source: (year = 2015) => {
        const yearToTiles = {
          2000: 'https://api.resourcewatch.org/v1/layer/709afed4-fc07-422f-a7ce-c8051f443d99/tile/gee/{z}/{x}/{y}',
          2001: 'https://api.resourcewatch.org/v1/layer/37a68f52-8e79-43ee-9c5c-ea8db5d4c166/tile/gee/{z}/{x}/{y}',
          2002: 'https://api.resourcewatch.org/v1/layer/d4035b7d-4e41-4406-80cc-4a9e288ab78f/tile/gee/{z}/{x}/{y}',
          2003: 'https://api.resourcewatch.org/v1/layer/9f0b8836-1947-4abd-be76-a26153a58b78/tile/gee/{z}/{x}/{y}',
          2004: 'https://api.resourcewatch.org/v1/layer/2daeb219-c454-4a5e-882a-2c6e53684051/tile/gee/{z}/{x}/{y}',
          2005: 'https://api.resourcewatch.org/v1/layer/432c1aa5-cd80-4023-9b20-1b4291be3022/tile/gee/{z}/{x}/{y}',
          2006: 'https://api.resourcewatch.org/v1/layer/abed6874-6d5d-4575-8935-defba9804e8c/tile/gee/{z}/{x}/{y}',
          2007: 'https://api.resourcewatch.org/v1/layer/f9192bd0-ea3f-4440-91df-9f6878249d6b/tile/gee/{z}/{x}/{y}',
          2008: 'https://api.resourcewatch.org/v1/layer/575b1cf1-a556-4a29-9793-f46ff12ff654/tile/gee/{z}/{x}/{y}',
          2009: 'https://api.resourcewatch.org/v1/layer/98c6d7ab-392a-4bfe-848f-f9e40ece29a9/tile/gee/{z}/{x}/{y}',
          2010: 'https://api.resourcewatch.org/v1/layer/5c42808b-7b33-48f2-9415-5d7c43781468/tile/gee/{z}/{x}/{y}',
          2011: 'https://api.resourcewatch.org/v1/layer/d00946b2-806d-4475-bcf5-08833e0a4c5b/tile/gee/{z}/{x}/{y}',
          2012: 'https://api.resourcewatch.org/v1/layer/b8711907-c63d-437f-a9d9-3f8d12418ee8/tile/gee/{z}/{x}/{y}',
          2013: 'https://api.resourcewatch.org/v1/layer/be996ac0-3228-44c1-9c75-cbe6955689b3/tile/gee/{z}/{x}/{y}',
          2014: 'https://api.resourcewatch.org/v1/layer/4a363e72-bb4a-4ced-8564-3403eaba1823/tile/gee/{z}/{x}/{y}',
          2015: 'https://api.resourcewatch.org/v1/layer/68a50d22-a821-4a39-bb1b-d51fd5fa85c9/tile/gee/{z}/{x}/{y}',
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
          name: 'Agriculture',
          color: '#fffd70',
        },
        {
          name: 'Forest',
          color: '#09630c',
        },
        {
          name: 'Grassland',
          color: '#3fa02c',
        },
        {
          name: 'Wetland',
          color: '#159578',
        },
        {
          name: 'Settlement',
          color: '#c11812',
        },
        {
          name: 'Shrubland',
          color: '#956314',
        },
        {
          name: 'Sparse Vegetation',
          color: '#c2e575',
        },
        {
          name: 'Bare Area',
          color: '#fff5d8',
        },
        {
          name: 'Water',
          color: '#0b4bc5',
        },
        {
          name: 'Permanent Snow and Ice',
          color: '#FFFFFF',
        },
      ],
      timeline: {
        range: false,
        interval: 'years',
        dateFormat: 'YYYY',
        minDate: '2001-01-01',
        maxDate: '2015-12-31',
      },
    },
  },
  'tree-plantations': {
    label: 'Tree plantations',
    attributions: ['rw'],
    config: {
      type: 'vector',
      source: {
        url: 'mapbox://resourcewatch.14e4gdsu',
        minzoom: 2,
        maxzoom: 12,
      },
      interactiveLayerIds: ['tree-plantations-1'],
      interactiveFeatureFormat: properties => ({
        Name: properties.common_name,
        'Planted/crop': properties.plant_ag,
        'Size class': properties.size,
        Source: properties.source,
        Year: properties.year,
      }),
      render: {
        layers: [
          {
            id: 'tree-plantations-1',
            type: 'fill',
            'source-layer': 'outnew',
            paint: {
              'fill-color': {
                default: '#a0c746',
                property: 'species_simp',
                stops: [
                  ['Oil Palm ', '#fdada9'],
                  ['Wood fiber / timber', '#98a7c4'],
                  ['Rubber', '#9993a3'],
                  ['Fruit', '#dada95'],
                  ['Other', '#d1e6ab'],
                  ['Wood fiber / timber Mix', '#9ebbf2'],
                  ['Oil Palm Mix', '#fcc4c1'],
                  ['Rubber Mix', '#a4fdff'],
                  ['Fruit Mix', '#fefe97'],
                  ['Other Mix', '#e1efc8'],
                  ['Unknown', '#dcd9d9'],
                  ['Recently cleared', '#d5a6ea'],
                ],
                type: 'categorical',
              },
              'fill-opacity': VECTOR_LAYERS_FILL_OPACITY,
            },
          },
          {
            type: 'line',
            'source-layer': 'outnew',
            paint: {
              'line-color': {
                default: '#a0c746',
                property: 'species_simp',
                stops: [
                  ['Oil Palm ', '#fdada9'],
                  ['Wood fiber / timber', '#98a7c4'],
                  ['Rubber', '#9993a3'],
                  ['Fruit', '#dada95'],
                  ['Other', '#d1e6ab'],
                  ['Wood fiber / timber Mix', '#9ebbf2'],
                  ['Oil Palm Mix', '#fcc4c1'],
                  ['Rubber Mix', '#a4fdff'],
                  ['Fruit Mix', '#fefe97'],
                  ['Other Mix', '#e1efc8'],
                  ['Unknown', '#dcd9d9'],
                  ['Recently cleared', '#d5a6ea'],
                ],
                type: 'categorical',
              },
              'line-opacity': 1,
              'line-width': 1,
            },
          },
        ],
      },
    },
    legend: {
      type: 'basic',
      items: [
        {
          color: '#fdada9',
          name: 'Oil Palm',
        },
        {
          color: '#98a7c4',
          name: 'Wood fiber / timber',
        },
        {
          color: '#9993a3',
          name: 'Rubber',
        },
        {
          color: '#dada95',
          name: 'Fruit',
        },
        {
          color: '#d1e6ab',
          name: 'Other',
        },
        {
          color: '#9ebbf2',
          name: 'Wood fiber / timber Mix',
        },
        {
          color: '#fcc4c1',
          name: 'Oil Palm Mix',
        },
        {
          color: '#a4fdff',
          name: 'Rubber Mix',
        },
        {
          color: '#fefe97',
          name: 'Fruit Mix',
        },
        {
          color: '#e1efc8',
          name: 'Other Mix',
        },
        {
          color: '#dcd9d9',
          name: 'Unknown',
        },
        {
          color: '#d5a6ea',
          name: 'Recently cleared',
        },
        {
          color: '#a0c746',
          name: 'Unknown Mix',
        },
      ],
    },
  },
  'protected-areas': {
    label: 'Protected areas',
    attributions: ['rw'],
    config: {
      type: 'vector',
      source: {
        minzoom: 0,
        maxzoom: 18,
        provider: {
          type: 'carto',
          account: 'rw-nrt',
          layers: [
            {
              options: {
                cartocss_version: '2.3.0',
                cartocss:
                  "#layer {polygon-opacity: 0.7;} [iucn_cat='II']{polygon-fill: #0f3b82;} [iucn_cat='III']{polygon-fill: #c9ddff;} [iucn_cat='IV']{polygon-fill: #b9b2a1;} [iucn_cat='Ia']{polygon-fill: #5ca2d1;} [iucn_cat='Ib']{polygon-fill: #3e7bb6;} [iucn_cat='Not Applicable']{polygon-fill: #eed54c;} [iucn_cat='Not Assigned']{polygon-fill: #e7ab36;} [iucn_cat='Not Reported']{polygon-fill: #fa894b;} [iucn_cat='V']{polygon-fill: #ae847e;} [iucn_cat='VI']{polygon-fill: #daa89b;}",
                sql: 'SELECT * FROM bio_007_world_database_on_protected_areas',
              },
              type: 'cartodb',
            },
          ],
        },
      },
      interactiveLayerIds: ['protected-areas-1'],
      interactiveFeatureFormat: properties => ({
        Name: properties.name,
        'WDPA ID': properties.wdpa_id,
        Status: properties.status,
        'Designation type': properties.desig_type,
        'Ownership type': properties.own_type,
        'Governance type': properties.gov_type,
        'Management authority': properties.mang_auth,
      }),
      render: {
        layers: [
          {
            id: 'protected-areas-1',
            type: 'fill',
            'source-layer': 'layer0',
            paint: {
              'fill-color': {
                type: 'categorical',
                property: 'iucn_cat',
                stops: [
                  ['II', '#0f3b82'],
                  ['III', '#c9ddff'],
                  ['IV', '#b9b2a1'],
                  ['Ia', '#5ca2d1'],
                  ['Ib', '#3e7bb6'],
                  ['Not Applicable', '#eed54c'],
                  ['Not Assigned', '#e7ab36'],
                  ['Not Reported', '#fa894b'],
                  ['V', '#ae847e'],
                  ['VI', '#daa89b'],
                ],
              },
              'fill-opacity': VECTOR_LAYERS_FILL_OPACITY,
            },
          },
          {
            type: 'line',
            'source-layer': 'layer0',
            paint: {
              'line-color': {
                type: 'categorical',
                property: 'iucn_cat',
                stops: [
                  ['II', '#0f3b82'],
                  ['III', '#c9ddff'],
                  ['IV', '#b9b2a1'],
                  ['Ia', '#5ca2d1'],
                  ['Ib', '#3e7bb6'],
                  ['Not Applicable', '#eed54c'],
                  ['Not Assigned', '#e7ab36'],
                  ['Not Reported', '#fa894b'],
                  ['V', '#ae847e'],
                  ['VI', '#daa89b'],
                ],
              },
              'line-width': 1,
              'line-opacity': 1,
            },
          },
        ],
      },
    },
    legend: {
      type: 'basic',
      items: [
        {
          color: '#5ca2d1',
          name: 'Ia - Strict nature reserve',
          id: 0,
        },
        {
          color: '#3e7bb6',
          name: 'Ib - Wildnerness area',
          id: 1,
        },
        {
          color: '#0f3b82',
          name: 'II - National park',
          id: 2,
        },
        {
          color: '#c9ddff',
          name: 'III - National monument or feature',
          id: 3,
        },
        {
          color: '#b9b2a1',
          name: 'IV - Habitat and species management area',
          id: 4,
        },
        {
          color: '#ae847e',
          name: 'V - Protected landscape or seascape',
          id: 5,
        },
        {
          color: '#daa89b',
          name: 'VI - Protected area with sustainable use of natural resources',
          id: 6,
        },
        {
          color: '#eed54c',
          name: 'Not applicable',
          id: 7,
        },
        {
          color: '#e7ab36',
          name: 'Not assigned',
          id: 8,
        },
        {
          color: '#fa894b',
          name: 'Not reported',
          id: 9,
        },
      ],
    },
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
  'logging-concessions': {
    label: 'Logging concessions',
    attributions: ['rw'],
    config: {
      type: 'vector',
      source: {
        minzoom: 2,
        maxzoom: 19,
        provider: {
          type: 'carto',
          account: 'wri-01',
          layers: [
            {
              options: {
                cartocss:
                  '#gfw_logging{polygon-fill: #fecc5c;  polygon-opacity: 0.7;  line-color: #fecc5c;  line-width: 0.1;  line-opacity: 1;}',
                cartocss_version: '2.3.0',
                sql:
                  'SELECT the_geom_webmercator, cartodb_id, name, country, round(area_ha::float) as area_ha, legal_term, company FROM gfw_logging',
              },
            },
          ],
        },
      },
      interactiveLayerIds: ['logging-concessions-1'],
      interactiveFeatureFormat: properties => ({
        Name: properties.name,
        Area: `${properties.area_ha} ha`,
      }),
      render: {
        layers: [
          {
            id: 'logging-concessions-1',
            type: 'fill',
            'source-layer': 'layer0',
            paint: {
              'fill-opacity': VECTOR_LAYERS_FILL_OPACITY,
              'fill-color': '#fecc5c',
            },
          },
          {
            type: 'line',
            'source-layer': 'layer0',
            paint: {
              'line-opacity': 1,
              'line-color': '#fecc5c',
              'line-width': 1,
            },
          },
        ],
      },
    },
    legend: {
      type: 'basic',
      items: [
        {
          color: '#fecc5c',
          name: 'Managed forests',
        },
      ],
    },
  },
  'mining-concessions': {
    label: 'Mining concessions',
    attributions: ['rw'],
    config: {
      type: 'vector',
      source: {
        url: 'mapbox://resourcewatch.3259d78x',
        minzoom: 2,
        maxzoom: 19,
      },
      interactiveLayerIds: ['mining-concessions-1'],
      interactiveFeatureFormat: properties => ({
        Name: properties.name,
        Status: properties.status,
        Company: properties.company,
        Permit: properties.permit,
        Mineral: properties.mineral,
        Type: properties.type,
        Area: `${properties.area_ha} ha`,
      }),
      render: {
        layers: [
          {
            id: 'mining-concessions-1',
            paint: {
              'fill-color': '#fbb685',
              'fill-opacity': VECTOR_LAYERS_FILL_OPACITY,
            },
            'source-layer': 'mining_v27022019',
            type: 'fill',
          },
          {
            paint: {
              'line-color': '#fbb685',
              'line-opacity': 1,
              'line-width': 1,
            },
            'source-layer': 'mining_v27022019',
            type: 'line',
          },
        ],
      },
    },
    legend: {
      type: 'basic',
      items: [
        {
          name: 'Mining',
          color: '#fbb685',
        },
      ],
    },
  },
  'oil-palm-concessions': {
    label: 'Oil palm concessions',
    attributions: ['rw'],
    config: {
      type: 'vector',
      source: {
        minzoom: 2,
        maxzoom: 19,
        provider: {
          type: 'carto',
          account: 'wri-01',
          layers: [
            {
              options: {
                cartocss:
                  '#gfw_oil_palm{  polygon-fill: #ee9587;  polygon-opacity: 0.7;  line-color: #ee9587;  line-width: 1;  line-opacity: 1;}',
                cartocss_version: '2.3.0',
                sql:
                  'SELECT cartodb_id, the_geom_webmercator, name,company, type, country, area_ha FROM gfw_oil_palm',
              },
              type: 'cartodb',
            },
          ],
        },
      },
      interactiveLayerIds: ['oil-palm-concessions-1'],
      interactiveFeatureFormat: properties => ({
        Name: properties.name,
        Area: `${properties.area_ha} ha`,
      }),
      render: {
        layers: [
          {
            id: 'oil-palm-concessions-1',
            paint: {
              'fill-color': '#ee9587',
              'fill-opacity': VECTOR_LAYERS_FILL_OPACITY,
            },
            'source-layer': 'layer0',
            type: 'fill',
          },
          {
            paint: {
              'line-color': '#ee9587',
              'line-opacity': 1,
              'line-width': 1,
            },
            'source-layer': 'layer0',
            type: 'line',
          },
        ],
      },
    },
    legend: {
      type: 'basic',
      items: [
        {
          name: 'Oil palm',
          color: '#ee9587',
        },
      ],
    },
  },
  'wood-fiber-concessions': {
    label: 'Wood fiber concessions by type',
    attributions: ['rw'],
    config: {
      type: 'vector',
      source: {
        minzoom: 2,
        maxzoom: 19,
        provider: {
          type: 'carto',
          account: 'wri-01',
          layers: [
            {
              options: {
                cartocss:
                  '#gov[source_typ="government"] { polygon-fill: #8A2F1D; polygon-opacity: 0.7; }                       #priv[source_typ="private sector"]{ polygon-fill: #EB5B31; polygon-opacity: 0.7; }',
                cartocss_version: '2.3.0',
                sql: 'SELECT * FROM gfw_woodfiber',
              },
              type: 'cartodb',
            },
          ],
        },
      },
      interactiveLayerIds: ['wood-fiber-concessions-1'],
      interactiveFeatureFormat: properties => ({
        Name: properties.name,
        Group: properties.group_comp,
        Source: properties.source,
        Type: properties.type,
        'Last update': properties.last_updat,
        Area: `${properties.area_ha} ha`,
      }),
      render: {
        layers: [
          {
            id: 'wood-fiber-concessions-1',
            type: 'fill',
            'source-layer': 'layer0',
            paint: {
              'fill-color': {
                type: 'categorical',
                property: 'source_typ',
                stops: [
                  ['government', '#8A2F1D'],
                  ['private sector', '#EB5B31'],
                ],
              },
              'fill-opacity': VECTOR_LAYERS_FILL_OPACITY,
            },
          },
          {
            type: 'line',
            'source-layer': 'layer0',
            paint: {
              'line-color': {
                type: 'categorical',
                property: 'source_typ',
                stops: [
                  ['government', '#8A2F1D'],
                  ['private sector', '#EB5B31'],
                ],
              },
              'line-opacity': 1,
              'line-width': 1,
            },
          },
        ],
      },
    },
    legend: {
      type: 'basic',
      items: [
        {
          color: '#8A2F1D',
          name: 'Government',
        },
        {
          color: '#EB5B31',
          name: 'Private sector',
        },
      ],
    },
  },
  'palm-oil-mills': {
    label: 'Palm oil mills',
    attributions: ['rw'],
    config: {
      type: 'vector',
      source: {
        minzoom: 2,
        maxzoom: 19,
        provider: {
          type: 'carto',
          account: 'wri-01',
          layers: [
            {
              options: {
                cartocss:
                  '#universal_mill_list{ marker-fill-opacity: 0.9; marker-line-color: #FFF; marker-line-width: 1; marker-line-opacity: 1; marker-placement: point; marker-type: ellipse; marker-width: 10; marker-fill: #EADC15; marker-allow-overlap: true; }',
                cartocss_version: '2.3.0',
                sql:
                  'SELECT cartodb_id, the_geom_webmercator, mill_name AS name, parent_com AS company_type, iso AS country, rspo_statu AS cert_status FROM universal_mill_list',
              },
              type: 'cartodb',
            },
          ],
        },
      },
      interactiveLayerIds: ['palm-oil-mills-1'],
      interactiveFeatureFormat: properties => ({
        Name: properties.name,
        Company: properties.company_type,
        'Certificate status': properties.cert_status,
      }),
      render: {
        layers: [
          {
            id: 'palm-oil-mills-1',
            paint: {
              'circle-color': '#EADC15',
              'circle-radius': ['interpolate', ['linear'], ['zoom'], 5, 2, 10, 10],
              'circle-stroke-color': '#FFF',
              'circle-stroke-opacity': 1,
              'circle-stroke-width': 0.5,
            },
            'source-layer': 'layer0',
            type: 'circle',
          },
        ],
      },
    },
    legend: {
      type: 'basic',
      items: [
        {
          color: '#EADC15',
          name: 'Palm oil mills',
        },
      ],
    },
  },
  mangroves: {
    label: 'Mangroves',
    attributions: ['rw'],
    config: {
      type: 'vector',
      source: (year = 2016) => ({
        minzoom: 0,
        maxzoom: 18,
        provider: {
          type: 'carto',
          account: 'wri-rw',
          layers: [
            {
              options: {
                cartocss_version: '2.3.0',
                cartocss:
                  '#layer {polygon-opacity: 1;polygon-fill:#368c2b;line-color: #368c2b;line-width: 0.1;line-opacity: 1;}',
                sql: `SELECT * FROM for_005a_mangrove_edit where year = ${year}`,
              },
              type: 'mapnik',
            },
          ],
        },
      }),
      render: {
        layers: [
          {
            paint: {
              'line-color': ' #368c2b',
              'line-width': 1,
              'line-opacity': 1,
            },
            'source-layer': 'layer0',
            type: 'line',
            filter: ['all'],
          },
          {
            paint: {
              'fill-opacity': VECTOR_LAYERS_FILL_OPACITY,
              'fill-color': '#368c2b',
            },
            'source-layer': 'layer0',
            type: 'fill',
            filter: ['all'],
          },
        ],
      },
    },
    legend: {
      type: 'basic',
      items: [
        {
          name: 'Mangrove forests',
          color: '#368c2b',
        },
      ],
      timeline: {
        step: null,
        range: false,
        interval: 'years',
        dateFormat: 'YYYY',
        minDate: '1996-01-01',
        maxDate: '2016-01-01',
        marks: {
          0: '1996',
          11: '',
          12: '',
          13: '',
          14: '',
          19: '',
          20: '2016',
        },
      },
    },
  },
  peatlands: {
    label: 'Peatlands',
    attributions: ['rw'],
    config: {
      type: 'vector',
      source: {
        minzoom: 0,
        maxzoom: 18,
        provider: {
          type: 'carto',
          account: 'wri-rw',
          layers: [
            {
              options: {
                sql: 'SELECT * FROM for_029_peatlands',
                cartocss:
                  '#for_029_peatlands{polygon-fill: #CD853F; polygon-opacity: 1; line-width: 0.3; line-color: #CD853F; line-opacity: 1;}',
                cartocss_version: '2.3.0',
              },
              type: 'mapnik',
            },
          ],
        },
      },
      interactiveLayerIds: ['peatlands-1'],
      interactiveFeatureFormat: properties => ({
        Area: properties.area,
      }),
      render: {
        layers: [
          {
            id: 'peatlands-1',
            paint: {
              'fill-color': ' #CD853F',
              'fill-opacity': VECTOR_LAYERS_FILL_OPACITY,
            },
            'source-layer': 'layer0',
            type: 'fill',
            filter: ['all'],
          },
          {
            paint: {
              'line-width': ['interpolate', ['linear'], ['zoom'], 0, 2, 6, 0.8, 12, 0.5],
              'line-color': ' #CD853F',
              'line-opacity': 1,
            },
            'source-layer': 'layer0',
            type: 'line',
            filter: ['all'],
          },
        ],
      },
    },
    legend: {
      type: 'basic',
      items: [
        {
          name: 'Peatland',
          color: '#CD853F',
        },
      ],
    },
  },
  'intact-forest-landscapes': {
    label: 'Intact Forest Landscapes',
    attributions: ['rw'],
    config: {
      type: 'vector',
      source: {
        minzoom: 0,
        maxzoom: 18,
        provider: {
          type: 'carto',
          account: 'wri-01',
          layers: [
            {
              options: {
                cartocss_version: '2.3.0',
                cartocss:
                  "#intact_forest_landscapes {polygon-opacity: 0.7;polygon-fill: #136400;line-width: 0;line-opacity: 1;}#intact_forest_landscapes[class_name='IFL change 2000-2013'] { polygon-fill:  rgb(152, 155, 5);}",
                sql: 'SELECT * FROM intact_forest_landscapes',
              },
              type: 'mapnik',
            },
          ],
        },
      },
      render: {
        layers: [
          {
            paint: {
              'line-color': ' #136400',
              'line-width': 1,
              'line-opacity': 1,
            },
            'source-layer': 'layer0',
            type: 'line',
            filter: ['all'],
          },
          {
            paint: {
              'fill-opacity': VECTOR_LAYERS_FILL_OPACITY,
              'fill-color': ' #136400',
            },
            'source-layer': 'layer0',
            type: 'fill',
            filter: ['all'],
          },
          {
            paint: {
              'line-color': '  rgb(152, 155, 5)',
              'line-width': 1,
              'line-opacity': 1,
            },
            'source-layer': 'layer0',
            type: 'line',
            filter: ['all', ['==', 'class_name', 'IFL change 2000-2013']],
          },
          {
            paint: {
              'fill-color': '  rgb(152, 155, 5)',
              'fill-opacity': VECTOR_LAYERS_FILL_OPACITY,
            },
            'source-layer': 'layer0',
            type: 'fill',
            filter: ['all', ['==', 'class_name', 'IFL change 2000-2013']],
          },
        ],
      },
    },
    legend: {
      type: 'basic',
      items: [
        {
          name: 'Intact Forest Landscapes',
          color: '#136400',
          id: 0,
        },
        {
          name: 'IFL change 2000-2013',
          color: 'rgb(152, 155, 5)',
          id: 1,
        },
      ],
    },
  },
  'all-crops': {
    label: 'All Crops',
    attributions: ['rw'],
    config: {
      type: 'vector',
      source: {
        minzoom: 3,
        maxzoom: 18,
        provider: {
          type: 'carto',
          account: 'wri-rw',
          layers: [
            {
              options: {
                cartocss_version: '2.3.0',
                cartocss:
                  "#layer { polygon-fill: ramp([crop], (#4B0082, #800080, #C71585, #DB7093, #FF1493, #FF69B4, #FFB6C1, #FFC0CB, #00008B, #0000CD, #0000FF, #1E90FF, #00BFFF, #87CEFA, #800000, #8B0000, #A52A2A, #B22222, #DC143C, #FFD700, #FFA500, #FF8C00, #FF6347, #006400, #228B22, #6B8E23, #556B2F, #808000, #2E8B57, #3CB371, #8FBC8F, #FFDAB9, #FFE4B5, #E6E6FA, #FFF0F5, #A0522D, #8B4513, #D2691E, #CD853F, #DAA520, #008000, #2F4F4F), ('wheat', 'rice', 'maize', 'barley', 'pearl millet', 'small millet', 'sorghum', 'other cereals', 'bean', 'chickpea', 'cowpea', 'pigeonpea', 'lentil', 'other pulses', 'potato', 'sweet potato', 'yams', 'cassava', 'other roots', 'banana', 'plantain', 'tropical fruit', 'temperate fruit', 'soybean', 'groundnut', 'coconut', 'oilpalm', 'sunflower', 'rapeseed', 'sesameseed', 'other oil crops', 'sugarcane', 'sugarbeet', 'cotton', 'other fibre crops', 'arabica coffee', 'robusta coffee', 'cocoa', 'tea', 'tobacco', 'vegetables', 'rest of crops'), '='); line-color: ramp([crop], (#4B0082, #800080, #C71585, #DB7093, #FF1493, #FF69B4, #FFB6C1, #FFC0CB, #00008B, #0000CD, #0000FF, #1E90FF, #00BFFF, #87CEFA, #800000, #8B0000, #A52A2A, #B22222, #DC143C, #FFD700, #FFA500, #FF8C00, #FF6347, #006400, #228B22, #6B8E23, #556B2F, #808000, #2E8B57, #3CB371, #8FBC8F, #FFDAB9, #FFE4B5, #E6E6FA, #FFF0F5, #A0522D, #8B4513, #D2691E, #CD853F, #DAA520, #008000, #2F4F4F), ('wheat', 'rice', 'maize', 'barley', 'pearl millet', 'small millet', 'sorghum', 'other cereals', 'bean', 'chickpea', 'cowpea', 'pigeonpea', 'lentil', 'other pulses', 'potato', 'sweet potato', 'yams', 'cassava', 'other roots', 'banana', 'plantain', 'tropical fruit', 'temperate fruit', 'soybean', 'groundnut', 'coconut', 'oilpalm', 'sunflower', 'rapeseed', 'sesameseed', 'other oil crops', 'sugarcane', 'sugarbeet', 'cotton', 'other fibre crops', 'arabica coffee', 'robusta coffee', 'cocoa', 'tea', 'tobacco', 'vegetables', 'rest of crops'), '=');}",
                sql: "SELECT * FROM merged_allcrops_dissolve_v1 WHERE iso<>'all'",
              },
              type: 'cartodb',
            },
          ],
        },
      },
      render: {
        layers: [
          {
            type: 'fill',
            'source-layer': 'layer0',
            paint: {
              'fill-color': {
                type: 'categorical',
                property: 'crop',
                stops: [
                  ['wheat', '#4B0082'],
                  ['rice', '#800080'],
                  ['maize', '#C71585'],
                  ['barley', '#DB7093'],
                  ['pearl millet', '#FF1493'],
                  ['small millet', '#FF69B4'],
                  ['sorghum', '#FFB6C1'],
                  ['other cereals', '#FFC0CB'],
                  ['bean', '#00008B'],
                  ['chickpea', '#0000CD'],
                  ['cowpea', '#0000FF'],
                  ['pigeonpea', '#1E90FF'],
                  ['lentil', '#00BFFF'],
                  ['other pulses', '#87CEFA'],
                  ['potato', '#800000'],
                  ['sweet potato', '#8B0000'],
                  ['yams', '#A52A2A'],
                  ['cassava', '#B22222'],
                  ['other roots', '#DC143C'],
                  ['banana', '#FFD700'],
                  ['plantain', '#FFA500'],
                  ['tropical fruit', '#FF8C00'],
                  ['temperate fruit', '#FF6347'],
                  ['soybean', '#006400'],
                  ['groundnut', '#228B22'],
                  ['coconut', '#6B8E23'],
                  ['oilpalm', '#556B2F'],
                  ['sunflower', '#808000'],
                  ['rapeseed', '#2E8B57'],
                  ['sesameseed', '#3CB371'],
                  ['other oil crops', '#8FBC8F'],
                  ['sugarcane', '#FFDAB9'],
                  ['sugarbeet', '#FFE4B5'],
                  ['cotton', '#E6E6FA'],
                  ['other fibre crops', '#FFF0F5'],
                  ['arabica coffee', '#A0522D'],
                  ['robusta coffee', '#8B4513'],
                  ['cocoa', '#D2691E'],
                  ['tea', '#CD853F'],
                  ['tobacco', '#DAA520'],
                  ['vegetables', '#008000'],
                  ['rest of crops', '#2F4F4F'],
                ],
              },
              'fill-opacity': VECTOR_LAYERS_FILL_OPACITY,
            },
          },
          {
            type: 'line',
            'source-layer': 'layer0',
            paint: {
              'line-color': {
                type: 'categorical',
                property: 'crop',
                stops: [
                  ['wheat', '#4B0082'],
                  ['rice', '#800080'],
                  ['maize', '#C71585'],
                  ['barley', '#DB7093'],
                  ['pearl millet', '#FF1493'],
                  ['small millet', '#FF69B4'],
                  ['sorghum', '#FFB6C1'],
                  ['other cereals', '#FFC0CB'],
                  ['bean', '#00008B'],
                  ['chickpea', '#0000CD'],
                  ['cowpea', '#0000FF'],
                  ['pigeonpea', '#1E90FF'],
                  ['lentil', '#00BFFF'],
                  ['other pulses', '#87CEFA'],
                  ['potato', '#800000'],
                  ['sweet potato', '#8B0000'],
                  ['yams', '#A52A2A'],
                  ['cassava', '#B22222'],
                  ['other roots', '#DC143C'],
                  ['banana', '#FFD700'],
                  ['plantain', '#FFA500'],
                  ['tropical fruit', '#FF8C00'],
                  ['temperate fruit', '#FF6347'],
                  ['soybean', '#006400'],
                  ['groundnut', '#228B22'],
                  ['coconut', '#6B8E23'],
                  ['oilpalm', '#556B2F'],
                  ['sunflower', '#808000'],
                  ['rapeseed', '#2E8B57'],
                  ['sesameseed', '#3CB371'],
                  ['other oil crops', '#8FBC8F'],
                  ['sugarcane', '#FFDAB9'],
                  ['sugarbeet', '#FFE4B5'],
                  ['cotton', '#E6E6FA'],
                  ['other fibre crops', '#FFF0F5'],
                  ['arabica coffee', '#A0522D'],
                  ['robusta coffee', '#8B4513'],
                  ['cocoa', '#D2691E'],
                  ['tea', '#CD853F'],
                  ['tobacco', '#DAA520'],
                  ['vegetables', '#008000'],
                  ['rest of crops', '#2F4F4F'],
                ],
              },
            },
          },
        ],
      },
    },
    legend: {
      type: 'group',
      items: [
        {
          items: [
            {
              color: '#4B0082',
              name: 'Wheat',
            },
            {
              color: '#800080',
              name: 'Rice',
            },
            {
              color: '#C71585',
              name: 'Maize',
            },
            {
              color: '#DB7093',
              name: 'Barley',
            },
            {
              color: '#FF1493',
              name: 'Pearl millet',
            },
            {
              color: '#FF69B4',
              name: 'Small millet',
            },
            {
              color: '#FFB6C1',
              name: 'Sorghum',
            },
            {
              color: '#FFC0CB',
              name: 'Other cereals',
            },
          ],
          color: '#C71585',
          name: 'Cereals',
        },
        {
          items: [
            {
              color: '#00008B',
              name: 'Beans',
            },
            {
              color: '#0000CD',
              name: 'Chickpeas',
            },
            {
              color: '#0000FF',
              name: 'Cowpeas',
            },
            {
              color: '#1E90FF',
              name: 'Pigeonpeas',
            },
            {
              color: '#00BFFF',
              name: 'Lentils',
            },
            {
              color: '#87CEFA',
              name: 'Other pulses',
            },
          ],
          color: '#0000FF',
          name: 'Pulses and legumes',
        },
        {
          items: [
            {
              color: '#800000',
              name: 'Potato',
            },
            {
              color: '#8B0000',
              name: 'Sweet potato',
            },
            {
              color: '#A52A2A',
              name: 'Yams',
            },
            {
              color: '#B22222',
              name: 'Cassava',
            },
            {
              color: '#DC143C',
              name: 'Other roots',
            },
          ],
          color: '#A52A2A',
          name: 'Roots And Tubers',
        },
        {
          items: [
            {
              color: '#FFD700',
              name: 'Banana',
            },
            {
              color: '#FFA500',
              name: 'Plantain',
            },
            {
              color: '#FF8C00',
              name: 'Tropical fruit',
            },
            {
              color: '#FF6347',
              name: 'Temperate fruit',
            },
          ],
          color: '#FFA500',
          name: 'Fruit and nuts',
        },
        {
          items: [
            {
              color: '#006400',
              name: 'Soybean',
            },
            {
              color: '#228B22',
              name: 'Groundnut',
            },
            {
              color: '#6B8E23',
              name: 'Coconut',
            },
            {
              color: '#556B2F',
              name: 'Oilpalm',
            },
            {
              color: '#808000',
              name: 'Sunflower',
            },
            {
              color: '#2E8B57',
              name: 'Rapeseed',
            },
            {
              color: '#3CB371',
              name: 'Sesameseed',
            },
            {
              color: '#8FBC8F',
              name: 'Other oil crops',
            },
          ],
          color: '#6B8E23',
          name: 'Oilseed crops',
        },
        {
          items: [
            {
              color: '#FFDAB9',
              name: 'Sugarcane',
            },
            {
              color: '#FFE4B5',
              name: 'Sugarbeet',
            },
          ],
          color: '#FFDAB9',
          name: 'Sugar crops',
        },
        {
          items: [
            {
              color: '#E6E6FA',
              name: 'Cotton',
            },
            {
              color: '#FFF0F5',
              name: 'Other fibre crops',
            },
          ],
          color: '#E6E6FA',
          name: 'Fibres',
        },
        {
          items: [
            {
              color: '#A0522D',
              name: 'Arabica coffee',
            },
            {
              color: '#8B4513',
              name: 'Robusta coffee',
            },
            {
              color: '#D2691E',
              name: 'Cocoa',
            },
            {
              color: '#CD853F',
              name: 'Tea',
            },
            {
              color: '#DAA520',
              name: 'Tobacco',
            },
          ],
          color: '#8B4513',
          name: 'Stimulants',
        },
        {
          items: [
            {
              color: '#008000',
              name: 'Vegetables',
            },
          ],
          color: '#008000',
          name: 'Vegetables',
        },
        {
          items: [
            {
              color: '#2F4F4F',
              name: 'Rest of crops',
            },
          ],
          color: '#2F4F4F',
          name: 'Other crops',
        },
      ],
    },
  },
  'forest-canopy-height': {
    label: 'Forest canopy height',
    attributions: [],
    config: {
      type: 'raster',
      source: {
        tiles: [
          `https://api.mapbox.com/v4/mongabay.0rgyb3bx/{z}/{x}/{y}.png?access_token=${process.env.MAPBOX_API_KEY}`,
        ],
        minzoom: 3,
        maxzoom: 12,
      },
    },
    legend: {
      type: 'gradient',
      items: [
        {
          color: '#ffffff',
          value: '0',
        },
        {
          color: '#559C01',
          value: '50 m',
        },
      ],
    },
    decodeParams: {},
    decodeFunction: `
      // The domain is the extent of the input values, the range of the output ones
      float domainMin = 0.;
      float domainMax = 50. / 255.;
      float rangeMin = 0.;
      float rangeMax = 1.;
      // The value of the pixel is stored in the 3 bands (R, G and B)
      float value = (color.r - domainMin) / (domainMax - domainMin) * (rangeMax - rangeMin) + rangeMin;
      // (255, 255, 255) and (85, 156, 1) are the RGB values of the scale
      if (value == 0.) {
        alpha = 0.;
      } else {
        color.r = ((1. - value) * 255. + value * 85.) / 255.;
        color.g = ((1. - value) * 255. + value * 156.) / 255.;
        color.b = ((1. - value) * 255. + value * 1.) / 255.;
      }
    `,
  },
  'indigenous-community-lands': {
    label: 'Indigenous and Community Lands',
    attributions: ['rw'],
    config: {
      type: 'vector',
      source: {
        tiles: [
          'https://tiles.globalforestwatch.org/landmark_land_rights/v20191111/default/{z}/{x}/{y}.pbf',
        ],
        minzoom: 0,
        maxzoom: 9,
      },
      interactiveLayerIds: [
        'indigenous-community-lands-1',
        'indigenous-community-lands-2',
        'indigenous-community-lands-3',
        'indigenous-community-lands-4',
        'indigenous-community-lands-5',
      ],
      interactiveFeatureFormat: properties => ({
        Country: properties.country,
        Identity: properties.identity,
        'Recognition status': properties.form_rec,
        'Documentation status': properties.doc_status,
        Name: properties.name,
        'Data contributor': properties.data_ctrb,
        'Data source': properties.data_src,
      }),
      render: {
        layers: [
          {
            id: 'indigenous-community-lands-1',
            filter: ['==', 'type', 'Indicative Areas'],
            paint: {
              'fill-color': '#9c9c9c',
              'fill-opacity': VECTOR_LAYERS_FILL_OPACITY,
            },
            'source-layer': 'landmark_land_rights',
            type: 'fill',
          },
          {
            filter: ['==', 'type', 'Indicative Areas'],
            paint: {
              'line-color': '#9c9c9c',
              'line-opacity': 1,
            },
            'source-layer': 'landmark_land_rights',
            type: 'line',
          },
          {
            id: 'indigenous-community-lands-2',
            filter: [
              'all',
              ['==', 'form_rec', 'Acknowledged by govt'],
              ['==', 'identity', 'Indigenous'],
            ],
            paint: {
              'fill-color': '#bf6938',
              'fill-opacity': VECTOR_LAYERS_FILL_OPACITY,
            },
            'source-layer': 'landmark_land_rights',
            type: 'fill',
          },
          {
            filter: [
              'all',
              ['==', 'form_rec', 'Acknowledged by govt'],
              ['==', 'identity', 'Indigenous'],
            ],
            paint: {
              'line-color': '#bf6938',
              'line-opacity': 1,
            },
            'source-layer': 'landmark_land_rights',
            type: 'line',
          },
          {
            id: 'indigenous-community-lands-3',
            filter: [
              'all',
              ['==', 'form_rec', 'Not acknowledged by govt'],
              ['==', 'identity', 'Indigenous'],
            ],
            paint: {
              'fill-color': '#f3aa72',
              'fill-opacity': VECTOR_LAYERS_FILL_OPACITY,
            },
            'source-layer': 'landmark_land_rights',
            type: 'fill',
          },
          {
            filter: [
              'all',
              ['==', 'form_rec', 'Not acknowledged by govt'],
              ['==', 'identity', 'Indigenous'],
            ],
            paint: {
              'line-color': '#f3aa72',
              'line-opacity': 1,
            },
            'source-layer': 'landmark_land_rights',
            type: 'line',
          },
          {
            id: 'indigenous-community-lands-4',
            filter: [
              'all',
              ['==', 'form_rec', 'Acknowledged by govt'],
              ['==', 'identity', 'Community'],
            ],
            paint: {
              'fill-color': '#2C5682',
              'fill-opacity': VECTOR_LAYERS_FILL_OPACITY,
            },
            'source-layer': 'landmark_land_rights',
            type: 'fill',
          },
          {
            filter: [
              'all',
              ['==', 'form_rec', 'Acknowledged by govt'],
              ['==', 'identity', 'Community'],
            ],
            paint: {
              'line-color': '#2C5682',
              'line-opacity': 1,
            },
            'source-layer': 'landmark_land_rights',
            type: 'line',
          },
          {
            id: 'indigenous-community-lands-5',
            filter: [
              'all',
              ['==', 'form_rec', 'Not acknowledged by govt'],
              ['==', 'identity', 'Community'],
            ],
            paint: {
              'fill-color': '#407ebe',
              'fill-opacity': VECTOR_LAYERS_FILL_OPACITY,
            },
            'source-layer': 'landmark_land_rights',
            type: 'fill',
          },
          {
            filter: [
              'all',
              ['==', 'form_rec', 'Not acknowledged by govt'],
              ['==', 'identity', 'Community'],
            ],
            paint: {
              'line-color': '#407ebe',
              'line-opacity': 1,
            },
            'source-layer': 'landmark_land_rights',
            type: 'line',
          },
        ],
      },
    },
    legend: {
      type: 'basic',
      items: [
        {
          color: '#bf6938',
          name: 'Indigenous Lands - Acknowledged by Government',
        },
        {
          color: '#f3aa72',
          name: 'Indigenous Lands - Not acknowledged by Government',
        },
        {
          color: '#2C5682',
          name: 'Community Lands - Acknowledged by Government',
        },
        {
          color: '#407ebe',
          name: 'Community Lands - Not acknowledged by Government',
        },
        {
          color: '#9c9c9c',
          name: 'Indicative Areas of Indigenous and Community Land Rights',
        },
      ],
    },
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
    ],
  },
};
