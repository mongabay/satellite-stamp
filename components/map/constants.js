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
  // 'tree-plantations': {
  //   label: 'Tree plantations',
  // },
  // 'protected-areas': {
  //   label: 'Protected areas',
  // },
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
    attributions: ['rw'],
    config: {
      type: 'raster',
      source: (year = 2020) => {
        const yearToTiles = {
          2000: 'https://api.resourcewatch.org/v1/layer/2a9e91e0-22ee-470d-a309-69f4838af435/tile/gee/{z}/{x}/{y}',
          2005: 'https://api.resourcewatch.org/v1/layer/a04b528a-99e0-4e67-93e7-fb57cb8dcebf/tile/gee/{z}/{x}/{y}',
          2010: 'https://api.resourcewatch.org/v1/layer/6c81cdc8-1634-41c5-9ba5-fe18f59fac30/tile/gee/{z}/{x}/{y}',
          2015: 'https://api.resourcewatch.org/v1/layer/396b74f7-643d-4299-8ff6-4780b27138cc/tile/gee/{z}/{x}/{y}',
          2020: 'https://api.resourcewatch.org/v1/layer/393fe0ef-7ff3-4a60-bd28-2b80325c8538/tile/gee/{z}/{x}/{y}',
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
        step: 5,
        range: false,
        interval: 'years',
        dateFormat: 'YYYY',
        minDate: '2000-01-01',
        maxDate: '2020-01-01',
      },
    },
  },
  // roads: {
  //   label: 'Roads',
  // },
  // 'logging-concessions': {
  //   label: 'Logging concessions',
  // },
  // 'mining-concessions': {
  //   label: 'Mining concessions',
  // },
  // 'oil-palm-concessions': {
  //   label: 'Oil palm concessions',
  // },
  // 'wood-fiber-concessions': {
  //   label: 'Wood fiber concessions by type',
  // },
  // 'palm-oil-mills': {
  //   label: 'Palm oil mills',
  // },
  // mangroves: {
  //   label: 'Mangroves',
  // },
  // peatlands: {
  //   label: 'Peatlands',
  // },
  // 'intact-forest-landscapes': {
  //   label: 'Intact Forest Landscapes',
  // },
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