import moment from 'moment';

export const mapStyle = 'mapbox://styles/mongabay/ckae6rtpe08l81ip77yc44aus';

export const VECTOR_LAYERS_FILL_OPACITY = 0.3;

export const ATTRIBUTIONS = {
  rw:
    'Powered by <a href="https://resourcewatch.org/" target="_blank" rel="noopener noreferrer">Resource Watch</a>',
  planet:
    'Basemap by <a href="https://www.planet.com/" target="_blank" rel="noopener noreferrer">Planet</a>',
  'global-fishing-watch':
    'Data from <a href="https://globalfishingwatch.org/" target="_blank" rel="noopener noreferrer">Global Fishing Watch</a>',
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
        // When temporal mode is set up with this layer, this param is hidden from the interface
        hiddenInTemporalMode: true,
        // When animated mode is set up with this layer, this param is hidden from the interface
        hiddenInAnimatedMode: true,
      },
    },
    // The legend is not displayed on the tool, it is only used for computing the temporal
    // difference's options
    legend: {
      type: 'basic',
      items: [
        {
          name: 'Landsat',
          color: '#020043',
        },
      ],
      timeline: {
        step: 1,
        range: false,
        interval: 'years',
        dateFormat: 'YYYY',
        minDate: '2013-01-01',
        maxDate: '2017-12-31',
      },
    },
    attributions: ['rw'],
  },
  planet: {
    label: 'Planet',
    minZoom: 0,
    maxZoom: 18,
    url: ({ key, interval, period }) => {
      if (!interval || !period) {
        return null;
      }

      return [
        `https://tiles0.planet.com/basemaps/v1/planet-tiles/${period}/gmap/{z}/{x}/{y}.png?api_key=${key}`,
        `https://tiles1.planet.com/basemaps/v1/planet-tiles/${period}/gmap/{z}/{x}/{y}.png?api_key=${key}`,
        `https://tiles2.planet.com/basemaps/v1/planet-tiles/${period}/gmap/{z}/{x}/{y}.png?api_key=${key}`,
        `https://tiles3.planet.com/basemaps/v1/planet-tiles/${period}/gmap/{z}/{x}/{y}.png?api_key=${key}`,
      ];
    },
    params: {
      key: {
        label: 'API key',
        default: '',
      },
      interval: {
        label: 'Interval',
        values: ['Monthly', 'Several months', 'Quarterly'],
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
    group: 'forests',
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
  'tree-cover-loss-cumulative': {
    label: 'Tree cover loss (cumulative)',
    attributions: ['rw'],
    group: 'forests',
    config: {
      type: 'raster',
      source: (year = 2020) => {
        const yearToTiles = {
          2001: `https://api.resourcewatch.org/v1/layer/c8d93d0e-a00f-4fd8-a944-1ffbc64fee69/tile/gee/{z}/{x}/{y}`,
          2002: `https://api.resourcewatch.org/v1/layer/7c567361-3af0-4fa8-bf34-a53b30714f47/tile/gee/{z}/{x}/{y}`,
          2003: `https://api.resourcewatch.org/v1/layer/ac301d2d-ee46-435b-8899-cc19970c5d3c/tile/gee/{z}/{x}/{y}`,
          2004: `https://api.resourcewatch.org/v1/layer/b9a617e6-b434-44e1-87bb-4873917498f0/tile/gee/{z}/{x}/{y}`,
          2005: `https://api.resourcewatch.org/v1/layer/c8012b53-8158-4198-820a-9d29dccffd79/tile/gee/{z}/{x}/{y}`,
          2006: `https://api.resourcewatch.org/v1/layer/85cd8901-d050-49b2-914f-753651c4a690/tile/gee/{z}/{x}/{y}`,
          2007: `https://api.resourcewatch.org/v1/layer/d8ca2f12-d1f9-4b14-94e8-7c55a3bcf66d/tile/gee/{z}/{x}/{y}`,
          2008: `https://api.resourcewatch.org/v1/layer/cc2d80a2-db3d-4922-81cc-2d50aba201a7/tile/gee/{z}/{x}/{y}`,
          2009: `https://api.resourcewatch.org/v1/layer/408e6b7d-f335-41a2-bce7-9677b514c1e0/tile/gee/{z}/{x}/{y}`,
          2010: `https://api.resourcewatch.org/v1/layer/470d199a-56e3-45a3-9905-6bb88dd102a9/tile/gee/{z}/{x}/{y}`,
          2011: `https://api.resourcewatch.org/v1/layer/87a9e844-7760-42f5-a92c-4d8e2833498d/tile/gee/{z}/{x}/{y}`,
          2012: `https://api.resourcewatch.org/v1/layer/d0c36d15-a6d0-41dc-b44f-72b1309aa664/tile/gee/{z}/{x}/{y}`,
          2013: `https://api.resourcewatch.org/v1/layer/f3b3cf11-587a-4600-9d46-8f3a03056fc8/tile/gee/{z}/{x}/{y}`,
          2014: `https://api.resourcewatch.org/v1/layer/4c918229-2e97-478e-bcd9-704cd50bf444/tile/gee/{z}/{x}/{y}`,
          2015: `https://api.resourcewatch.org/v1/layer/b7557ca6-3382-4426-aa7f-a4e11a1a3411/tile/gee/{z}/{x}/{y}`,
          2016: `https://api.resourcewatch.org/v1/layer/22043999-9f4d-4d06-87f6-e8910c75bbcf/tile/gee/{z}/{x}/{y}`,
          2017: `https://api.resourcewatch.org/v1/layer/053dff4b-9d05-4462-a6f8-90e945891246/tile/gee/{z}/{x}/{y}`,
          2018: `https://api.resourcewatch.org/v1/layer/a37d1d19-3bf8-4d7d-8cce-1158f9ef6a12/tile/gee/{z}/{x}/{y}`,
          2019: `https://api.resourcewatch.org/v1/layer/bc0a5617-c38b-4efd-805a-26e1811524b3/tile/gee/{z}/{x}/{y}`,
          2020: `https://api.resourcewatch.org/v1/layer/5f6d1cd9-596d-49b9-93d8-326d3657f7a3/tile/gee/{z}/{x}/{y}`,
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
      alignment: 'columns',
      items: (year = 2020) => {
        const items = [
          { name: '2001', color: '#f1eef6' },
          { name: '2002', color: '#EBE1EC' },
          { name: '2003', color: '#E6D4E2' },
          { name: '2004', color: '#E1C8D9' },
          { name: '2005', color: '#DCBBCF' },
          { name: '2006', color: '#D7AFC5' },
          { name: '2007', color: '#D2A2BC' },
          { name: '2008', color: '#CD96B2' },
          { name: '2009', color: '#C889A8' },
          { name: '2010', color: '#C37D9F' },
          { name: '2011', color: '#BE7095' },
          { name: '2012', color: '#B9648C' },
          { name: '2013', color: '#B45782' },
          { name: '2014', color: '#AF4B78' },
          { name: '2015', color: '#AA3E6F' },
          { name: '2016', color: '#A53265' },
          { name: '2017', color: '#A0255B' },
          { name: '2018', color: '#9B1952' },
          { name: '2019', color: '#960C48' },
          { name: '2020', color: '#760b39' },
        ];

        return items.slice(0, year - 2001 + 1);
      },
      timeline: {
        step: 1,
        range: false,
        interval: 'years',
        dateFormat: 'YYYY',
        minDate: '2000-01-01',
        maxDate: '2020-01-01',
      },
    },
  },
  glad: {
    label: 'Deforestation alerts (GLAD)',
    attributions: ['rw'],
    group: 'forests',
    init: async layer => {
      try {
        const res = await fetch('https://api.resourcewatch.org/v1/glad-alerts/latest');
        const { data } = await res.json();
        const date = data[0].attributes.date;
        const daysDifference = moment(date).diff(moment(layer.legend.timeline.minDate), 'days');

        layer.legend.timeline.maxDate = date;
        layer.decodeParams = {
          ...layer.decodeParams,
          numberOfDays: daysDifference,
          endDayIndex: daysDifference,
        };
      } catch (e) {
        console.error('Unable to initialize the GLAD layer.');
        console.error(e);
      }
    },
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
    params: {
      confirmedOnly: {
        label: 'Confirmed alerts only',
        default: false,
      },
    },
    decodeParams: {
      numberOfDays: 1961,
      startDayIndex: 0,
      endDayIndex: 1961,
      confirmedOnly: 0,
    },
    decodeFunction: `
      // values for creating power scale, domain (input), and range (output)
      float confidenceValue = 0.;
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
    group: 'forests',
    config: {
      type: 'raster',
      source: (year = 2010, { canopyDensity = 30 }) => {
        const yearToTiles = {
          2000: `https://earthengine.google.org/static/hansen_2014/gfw_loss_tree_year_${canopyDensity}_2014/{z}/{x}/{y}.png`,
          2010: `https://storage.googleapis.com/wri-public/treecover/2010/${canopyDensity}/{z}/{x}/{y}.png`,
        };

        return {
          tiles: [yearToTiles[year]],
          minzoom: 2,
          maxzoom: 12,
        };
      },
    },
    params: {
      canopyDensity: {
        label: 'Minimum canopy density percentage',
        values: [10, 15, 20, 25, 30, 50, 75],
        default: 30,
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
    group: 'forests',
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
    group: 'forests',
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
    group: 'food-agriculture',
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
    group: 'food-agriculture',
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
    group: 'conservation',
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
    group: 'people',
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
    group: 'people',
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
    group: 'industry',
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
    group: 'industry',
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
    group: 'industry',
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
    group: 'industry',
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
    group: 'industry',
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
    group: 'oceans',
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
    group: 'forests',
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
    group: 'forests',
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
    group: 'food-agriculture',
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
    group: 'forests',
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
    group: 'people',
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
  'chicken-density': {
    label: 'Chicken density (chickens/km²)',
    attributions: ['rw'],
    group: 'food-agriculture',
    config: {
      type: 'raster',
      source: {
        tiles: [
          'https://api.resourcewatch.org/v1/layer/8e5a3837-06af-4b19-9623-c4e91ef19459/tile/gee/{z}/{x}/{y}',
        ],
        minzoom: 2,
        maxzoom: 12,
      },
    },
    legend: {
      type: 'choropleth',
      items: [
        {
          name: '≥1',
          color: '#fff7ec',
        },
        {
          name: '≤50',
          color: '#fee8c8',
        },
        {
          name: '≤100',
          color: '#fdd49e',
        },
        {
          name: '≤250',
          color: '#fdbb84',
        },
        {
          name: '≤500',
          color: '#fc8d59',
        },
        {
          name: '≤1k',
          color: '#ef6548',
        },
        {
          name: '≤2.5k',
          color: '#d7301f',
        },
        {
          name: '≤10k',
          color: '#b30000',
        },
        {
          name: '>10k',
          color: '#7f0000',
        },
      ],
    },
  },
  'pig-density': {
    label: 'Pig density (pigs/km²)',
    attributions: ['rw'],
    group: 'food-agriculture',
    config: {
      type: 'raster',
      source: {
        tiles: [
          'https://api.resourcewatch.org/v1/layer/b1a001f5-3af8-4cc9-803d-3acedeb31088/tile/gee/{z}/{x}/{y}',
        ],
        minzoom: 2,
        maxzoom: 12,
      },
    },
    legend: {
      type: 'choropleth',
      items: [
        {
          name: '≥1',
          color: '#fde0dd',
        },
        {
          name: '≤5',
          color: '#fcc5c0',
        },
        {
          name: '≤10',
          color: '#fa9fb5',
        },
        {
          name: '≤20',
          color: '#f768a1',
        },
        {
          name: '≤50',
          color: '#dd3497',
        },
        {
          name: '≤100',
          color: '#ae017e',
        },
        {
          name: '≤250',
          color: '#7a0177',
        },
        {
          name: '>250',
          color: '#49006a',
        },
      ],
    },
  },
  'cattle-density': {
    label: 'Cattle density (cattle/km²)',
    attributions: ['rw'],
    group: 'food-agriculture',
    config: {
      type: 'raster',
      source: {
        tiles: [
          'https://api.resourcewatch.org/v1/layer/10587041-b4c5-493d-ac9e-cf75bc2d58b7/tile/gee/{z}/{x}/{y}',
        ],
        minzoom: 2,
        maxzoom: 12,
      },
    },
    legend: {
      type: 'choropleth',
      items: [
        {
          name: '≥1',
          color: '#FFFFE5',
        },
        {
          name: '≤5',
          color: '#FFF7BC',
        },
        {
          name: '≤10',
          color: '#FEE391',
        },
        {
          name: '≤20',
          color: '#FEC44F',
        },
        {
          name: '≤50',
          color: '#FE9929',
        },
        {
          name: '≤100',
          color: '#EC7014',
        },
        {
          name: '≤250',
          color: '#CC4C02',
        },
        {
          name: '>250',
          color: '#8C2D04',
        },
      ],
    },
  },
  'biodiversity-intactness': {
    label: 'Biodiversity intactness',
    attributions: ['rw'],
    group: 'conservation',
    config: {
      type: 'raster',
      source: {
        tiles: [
          'https://api.resourcewatch.org/v1/layer/70e900f1-2c37-470d-9367-7b34567e3084/tile/gee/{z}/{x}/{y}',
        ],
        minzoom: 2,
        maxzoom: 12,
      },
    },
    legend: {
      type: 'choropleth',
      items: [
        {
          name: '≤60',
          color: '#a50026',
        },
        {
          name: '≤70',
          color: '#d73027',
        },
        {
          name: '≤75',
          color: '#f46d43',
        },
        {
          name: '≤80',
          color: '#fdae61',
        },
        {
          name: '≤85',
          color: '#fee08b',
        },
        {
          name: '≤90',
          color: '#d9ef8b',
        },
        {
          name: '≤95',
          color: '#a6d96a',
        },
        {
          name: '≤97.5',
          color: '#66bd63',
        },
        {
          name: '≤100',
          color: '#1a9850',
        },
        {
          name: '>100',
          color: '#006837',
        },
      ],
    },
  },
  'endangered-species-critical-habitats': {
    label: 'Endangered species critical habitats',
    attributions: ['rw'],
    group: 'conservation',
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
                sql: 'SELECT * FROM bio_001_endangered_species_critical_habitats',
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
              'line-width': 1,
              'line-color': ' #b2d26e',
              'line-opacity': 1,
            },
            'source-layer': 'layer0',
            type: 'line',
            filter: ['all'],
          },
          {
            id: 'endangered-species-critical-habitats-1',
            paint: {
              'fill-color': ' #b2d26e',
              'fill-opacity': VECTOR_LAYERS_FILL_OPACITY,
            },
            'source-layer': 'layer0',
            type: 'fill',
            filter: ['all'],
          },
        ],
      },
      interactiveLayerIds: ['endangered-species-critical-habitats-1'],
      interactiveFeatureFormat: properties => ({
        Country: properties.country,
        'Site Name': properties.natname,
        'Area ID': properties.cartodb_id,
      }),
    },
    legend: {
      type: 'basic',
      items: [
        {
          color: '#b2d26e',
          name: 'Alliance for Zero Extinction sites',
        },
      ],
    },
  },
  'forest-landscape-integrity-index': {
    label: 'Forest landscape integrity index',
    attributions: ['rw'],
    group: 'forests',
    config: {
      type: 'raster',
      source: {
        tiles: [
          'https://api.resourcewatch.org/v1/layer/67a4c2d8-b469-4bb5-a881-8ad1285bc1d4/tile/gee/{z}/{x}/{y}',
        ],
      },
      minzoom: 2,
      maxzoom: 12,
    },
    legend: {
      type: 'gradient',
      items: [
        {
          color: '#6f5817',
          name: '0',
        },
        {
          color: '#987e2c',
          name: '1',
        },
        {
          color: '#b99e3e',
          name: '2',
        },
        {
          color: '#dabc4d',
          name: '3',
        },
        {
          color: '#e1c94a',
          name: '4',
        },
        {
          color: '#d7cc40',
          name: '5',
        },
        {
          color: '#ced035',
          name: '6',
        },
        {
          color: '#bdce28',
          name: '7',
        },
        {
          color: '#a4c31e',
          name: '8',
        },
        {
          color: '#6ba211',
          name: '9',
        },
        {
          color: '#318002',
          name: '10',
        },
      ],
    },
  },
  'power-plants-by-capacity-and-fuel-type': {
    label: 'Power plants by capacity and fuel type',
    attributions: ['rw'],
    group: 'industry',
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
                sql: 'SELECT * FROM powerwatch_data_20180102',
              },
              type: 'mapnik',
            },
          ],
        },
      },
      render: {
        layers: [
          {
            id: 'power-plants-by-capacity-and-fuel-type-1',
            paint: {
              'circle-color': [
                'match',
                ['get', 'primary_fuel'],
                'Coal',
                '#000',
                'Oil',
                '#B15928',
                'Gas',
                '#BC80BD',
                'Hydro',
                '#1F78B4',
                'Nuclear',
                '#E31A1C',
                'Solar',
                '#FF7F00',
                'Waste',
                '#6A3D9A',
                'Wind',
                '#5CA2D1',
                'Geothermal',
                '#FDBF6F',
                'Biomass',
                '#229A00',
                'Others',
                '#B2DF8A',
                '#B2DF8A',
              ],
              'circle-stroke-width': 0.2,
              'circle-stroke-color': '#FFF',
              'circle-opacity': 0.9,
              'circle-stroke-opacity': 0.5,
              'circle-radius': [
                'interpolate',
                ['linear'],
                ['zoom'],
                0,
                ['+', 0.1, ['/', ['sqrt', ['/', ['get', 'capacity_mw'], ['pi']]], 20]],
                12,
                ['+', 4, ['/', ['sqrt', ['/', ['get', 'capacity_mw'], ['pi']]], 3]],
              ],
            },
            'source-layer': 'layer0',
            type: 'circle',
            layout: {
              'circle-sort-key': ['get', 'capacity_mw'],
            },
            filter: ['all'],
          },
        ],
      },
      interactiveLayerIds: ['power-plants-by-capacity-and-fuel-type-1'],
      interactiveFeatureFormat: properties => ({
        Country: properties.country_long,
        Name: properties.name,
        'Fuel Type': properties.primary_fuel,
        Owner: properties.owner,
        Capacity: `${properties.capacity_mw || '−'} MW`,
        'Data Source': properties.source,
        'Reported Generation (2018)': `${properties.generation_gwh_2018 || '−'} GWh`,
        'Estimated Generation (2017)': `${properties.estimated_generation_gwh_2017 || '−'} GWh`,
      }),
    },
    legend: {
      type: 'basic',
      alignment: 'columns',
      items: [
        {
          color: '#000000',
          name: 'Coal',
        },
        {
          color: '#B15928',
          name: 'Oil',
        },
        {
          color: '#BC80BD',
          name: 'Gas',
        },
        {
          color: '#1F78B4',
          name: 'Hydro',
        },
        {
          color: '#E31A1C',
          name: 'Nuclear',
        },
        {
          color: '#FF7F00',
          name: 'Solar',
        },
        {
          color: '#6A3D9A',
          name: 'Waste',
        },
        {
          color: '#5CA2D1',
          name: 'Wind',
        },
        {
          color: '#FDBF6F',
          name: 'Geothermal',
        },
        {
          color: '#229A00',
          name: 'Biomass',
        },
        {
          color: '#B2DF8A',
          name: 'Others',
        },
      ],
    },
  },
  reservoirs: {
    label: 'Reservoirs',
    attributions: ['rw'],
    group: 'industry',
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
                sql:
                  "SELECT * FROM ene_001a_grand_dams_and_reservoirs_v1_3 WHERE type='reservoir' and rem_year=-99",
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
              'line-width': 1,
              'line-color': '#4292c6',
              'line-opacity': 1,
            },
            'source-layer': 'layer0',
            type: 'line',
            filter: ['all'],
          },
          {
            id: 'reservoirs-1',
            paint: {
              'fill-color': '#4292c6',
              'fill-opacity': VECTOR_LAYERS_FILL_OPACITY,
            },
            'source-layer': 'layer0',
            type: 'fill',
            filter: ['all'],
          },
        ],
      },
      interactiveLayerIds: ['reservoirs-1'],
      interactiveFeatureFormat: properties => ({
        'Reservoir Name': properties.res_name,
        'Surface Area': `${properties.area_skm || '−'} km²`,
        Capacity: `${properties.cap_mcm || '−'} million m³`,
      }),
    },
    legend: {
      type: 'basic',
      items: [
        {
          color: '#4292c6',
          name: 'Reservoirs',
        },
      ],
    },
  },
  dams: {
    label: 'Dams',
    attributions: ['rw'],
    group: 'industry',
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
                sql:
                  "SELECT * FROM ene_001a_grand_dams_and_reservoirs_v1_3 WHERE type='dam' and rem_year=-99",
              },
              type: 'mapnik',
            },
          ],
        },
      },
      render: {
        layers: [
          {
            id: 'dams-1',
            paint: {
              'circle-opacity': 1,
              'circle-stroke-width': 0.3,
              'circle-stroke-color': '#FFF',
              'circle-stroke-opacity': 0,
              'circle-radius': [
                'interpolate',
                ['linear'],
                ['zoom'],
                0,
                3,
                3,
                4,
                5,
                7,
                7,
                12,
                9,
                15,
              ],
              'circle-color': '#34687f',
            },
            'source-layer': 'layer0',
            type: 'circle',
          },
        ],
      },
      interactiveLayerIds: ['dams-1'],
      interactiveFeatureFormat: properties => ({
        'Dam Name': properties.dam_name,
        'Impounded Waterway': properties.river,
        'Main Use': properties.main_use,
      }),
    },
    legend: {
      type: 'basic',
      items: [
        {
          color: '#34687f',
          name: 'Dams',
        },
      ],
    },
  },
  'fishing-activity': {
    label: 'Fishing activity',
    attributions: ['rw', 'global-fishing-watch'],
    group: 'oceans',
    config: {
      type: 'raster',
      source: (year = 2021) => {
        const yearToTiles = {
          2012: "https://gateway.api.globalfishingwatch.org/v1/4wings/tile/heatmap/{z}/{x}/{y}?format=png&interval=10days&datasets[0]=public-global-fishing-effort:latest&filters[0]=geartype in ('tuna_purse_seines','driftnets','trollers','set_longlines','purse_seines','pots_and_traps','other_fishing','set_gillnets','fixed_gear','fishing','seiners','other_purse_seines','other_seines','squid_jigger','pole_and_line','drifting_longlines')&date-range=2012-01-01T00:00:00.000Z,2013-01-01T00:00:00.000Z&style=eyJjb2xvciI6WzI0MiwwLDEzN10sInJhbXAiOlswLDY2Ny4xNjAwMDAwMDAwMDAxLDIyNTQuNzExNjY2NjY2NjY3LDQ3MTYuNDMzMDU1NTU1NTU1LDgwODUuMzUxOTQ0NDQ0NDQ1LDEzMzUyLjc3OTcyMjIyMjIyMywyMjMzNi4zNjE5NDQ0NDQ0NTYsMzQzMzkuMjA1ODMzMzMzMzMsNjM4MzAuNjk0NzIyMjIyMjRdfQ==&token=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImtpZEtleSJ9.eyJkYXRhIjp7Im5hbWUiOiI0d2luZ3MiLCJhcHBsaWNhdGlvbk5hbWUiOiJXUkkiLCJpZCI6MTIsInR5cGUiOiJhcHBsaWNhdGlvbiJ9LCJpYXQiOjE2Mjg3NTE0MDgsImV4cCI6MTc4NjQzMTQwOCwiYXVkIjoiZ2Z3IiwiaXNzIjoiZ2Z3In0.BDLq4f4kiAIuaHosOGXQW4Mo6bprxh50v6CataI61HZckiTJAcQ9iZ8SRZ8VENb1AoqiOHlrN4WcmeqwcH9ATN2US8IxxWhwKj87C7jYfJh2p9YU_D8JhVwtK4UAPS9LWFfnrXLCVIwo_QqZdKiwxoFwfJn2YEiO10JI4MRkDDuae0I38r1olbWofz6nEYLW-tOBNG1suOPhqe3IzNFf4CmjnSIvJVoB4HrVRFgpuVrt0xNSB6XYz46hMLyuFErVtiX96gwMDaRIveNC4dEQoaiBj465LUT6FuCxGzR4vbmdBFO_46ngktwwkGvjFWeyw5ueXsVvteKUUO2hNWBMUIlHnPZJPJmMGKVlkI0iLrLOC1FmY9P2lC-pwveSRXTBNLu842HgFzpsX8A4nogSwJgDAqwc6mNHM3osZTaGyO7dNWzw7BI3kVt43Zp6oRwZPSdIavIIlzXWrC-9eozKt5S2cG0dU8o8xg0NDtNpl3eo0EZgON7QsuSTo8ofinzY",
          2013: "https://gateway.api.globalfishingwatch.org/v1/4wings/tile/heatmap/{z}/{x}/{y}?format=png&interval=10days&datasets[0]=public-global-fishing-effort:latest&filters[0]=geartype in ('tuna_purse_seines','driftnets','trollers','set_longlines','purse_seines','pots_and_traps','other_fishing','set_gillnets','fixed_gear','fishing','seiners','other_purse_seines','other_seines','squid_jigger','pole_and_line','drifting_longlines')&date-range=2013-01-01T00:00:00.000Z,2014-01-01T00:00:00.000Z&style=eyJjb2xvciI6WzI0MiwwLDEzN10sInJhbXAiOlswLDI1MjkuMjA1NTU1NTU1NTU1Myw4NzkxLjQwNTI3Nzc3Nzc3OCwyMTY2OS4xNTYxMTExMTExMTUsNDgwOTIuMjEzMzMzMzMzMzI2LDg5MjcwLjIyMTk0NDQ0NDQ2LDE0NDE5NS43ODM2MTExMTEyLDMxOTE4NC45MDYxMTExMTA5MywzOTg2NjAuOTMwODMzMzMzMl19&token=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImtpZEtleSJ9.eyJkYXRhIjp7Im5hbWUiOiI0d2luZ3MiLCJhcHBsaWNhdGlvbk5hbWUiOiJXUkkiLCJpZCI6MTIsInR5cGUiOiJhcHBsaWNhdGlvbiJ9LCJpYXQiOjE2Mjg3NTE0MDgsImV4cCI6MTc4NjQzMTQwOCwiYXVkIjoiZ2Z3IiwiaXNzIjoiZ2Z3In0.BDLq4f4kiAIuaHosOGXQW4Mo6bprxh50v6CataI61HZckiTJAcQ9iZ8SRZ8VENb1AoqiOHlrN4WcmeqwcH9ATN2US8IxxWhwKj87C7jYfJh2p9YU_D8JhVwtK4UAPS9LWFfnrXLCVIwo_QqZdKiwxoFwfJn2YEiO10JI4MRkDDuae0I38r1olbWofz6nEYLW-tOBNG1suOPhqe3IzNFf4CmjnSIvJVoB4HrVRFgpuVrt0xNSB6XYz46hMLyuFErVtiX96gwMDaRIveNC4dEQoaiBj465LUT6FuCxGzR4vbmdBFO_46ngktwwkGvjFWeyw5ueXsVvteKUUO2hNWBMUIlHnPZJPJmMGKVlkI0iLrLOC1FmY9P2lC-pwveSRXTBNLu842HgFzpsX8A4nogSwJgDAqwc6mNHM3osZTaGyO7dNWzw7BI3kVt43Zp6oRwZPSdIavIIlzXWrC-9eozKt5S2cG0dU8o8xg0NDtNpl3eo0EZgON7QsuSTo8ofinzY",
          2014: "https://gateway.api.globalfishingwatch.org/v1/4wings/tile/heatmap/{z}/{x}/{y}?format=png&interval=10days&datasets[0]=public-global-fishing-effort:latest&filters[0]=geartype in ('tuna_purse_seines','driftnets','trollers','set_longlines','purse_seines','pots_and_traps','other_fishing','set_gillnets','fixed_gear','fishing','seiners','other_purse_seines','other_seines','squid_jigger','pole_and_line','drifting_longlines')&date-range=2014-01-01T00:00:00.000Z,2015-01-01T00:00:00.000Z&style=eyJjb2xvciI6WzI0MiwwLDEzN10sInJhbXAiOlswLDM3OTYuOTg3MjIyMjIyMjIxNiwxMzkwMi45MTkxNjY2NjY2NjMsMzQ0ODQuMTAxMzg4ODg4OTEsNzQ1NzYuMzQyNTAwMDAwMDMsMTY2MDk0LjU5NDQ0NDQ0NDUsMjQ1MzgzLjIzMjIyMjIyMjIsMzM5MDQ2LjU0MDI3Nzc3NzksNDY1OTI2LjU0OTcyMjIyMTddfQ==&token=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImtpZEtleSJ9.eyJkYXRhIjp7Im5hbWUiOiI0d2luZ3MiLCJhcHBsaWNhdGlvbk5hbWUiOiJXUkkiLCJpZCI6MTIsInR5cGUiOiJhcHBsaWNhdGlvbiJ9LCJpYXQiOjE2Mjg3NTE0MDgsImV4cCI6MTc4NjQzMTQwOCwiYXVkIjoiZ2Z3IiwiaXNzIjoiZ2Z3In0.BDLq4f4kiAIuaHosOGXQW4Mo6bprxh50v6CataI61HZckiTJAcQ9iZ8SRZ8VENb1AoqiOHlrN4WcmeqwcH9ATN2US8IxxWhwKj87C7jYfJh2p9YU_D8JhVwtK4UAPS9LWFfnrXLCVIwo_QqZdKiwxoFwfJn2YEiO10JI4MRkDDuae0I38r1olbWofz6nEYLW-tOBNG1suOPhqe3IzNFf4CmjnSIvJVoB4HrVRFgpuVrt0xNSB6XYz46hMLyuFErVtiX96gwMDaRIveNC4dEQoaiBj465LUT6FuCxGzR4vbmdBFO_46ngktwwkGvjFWeyw5ueXsVvteKUUO2hNWBMUIlHnPZJPJmMGKVlkI0iLrLOC1FmY9P2lC-pwveSRXTBNLu842HgFzpsX8A4nogSwJgDAqwc6mNHM3osZTaGyO7dNWzw7BI3kVt43Zp6oRwZPSdIavIIlzXWrC-9eozKt5S2cG0dU8o8xg0NDtNpl3eo0EZgON7QsuSTo8ofinzY",
          2015: "https://gateway.api.globalfishingwatch.org/v1/4wings/tile/heatmap/{z}/{x}/{y}?format=png&interval=10days&datasets[0]=public-global-fishing-effort:latest&filters[0]=geartype in ('tuna_purse_seines','driftnets','trollers','set_longlines','purse_seines','pots_and_traps','other_fishing','set_gillnets','fixed_gear','fishing','seiners','other_purse_seines','other_seines','squid_jigger','pole_and_line','drifting_longlines')&date-range=2015-01-01T00:00:00.000Z,2016-01-01T00:00:00.000Z&style=eyJjb2xvciI6WzI0MiwwLDEzN10sInJhbXAiOlswLDM0MTMuODgyMjIyMjIyMjIxNiwxMjIzNi4xMzMwNTU1NTU1NTgsMzE0MzYuMzc1ODMzMzMzMzQsNjk2NTcuMTQxNjY2NjY2NjksMTI3Mzk1LjEyODYxMTExMTE0LDE4MjUyNS43MDIyMjIyMjIzNSwyNzIxNDcuMDc5NzIyMjIyNDYsMzk3OTc0LjMzODMzMzMzM119&token=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImtpZEtleSJ9.eyJkYXRhIjp7Im5hbWUiOiI0d2luZ3MiLCJhcHBsaWNhdGlvbk5hbWUiOiJXUkkiLCJpZCI6MTIsInR5cGUiOiJhcHBsaWNhdGlvbiJ9LCJpYXQiOjE2Mjg3NTE0MDgsImV4cCI6MTc4NjQzMTQwOCwiYXVkIjoiZ2Z3IiwiaXNzIjoiZ2Z3In0.BDLq4f4kiAIuaHosOGXQW4Mo6bprxh50v6CataI61HZckiTJAcQ9iZ8SRZ8VENb1AoqiOHlrN4WcmeqwcH9ATN2US8IxxWhwKj87C7jYfJh2p9YU_D8JhVwtK4UAPS9LWFfnrXLCVIwo_QqZdKiwxoFwfJn2YEiO10JI4MRkDDuae0I38r1olbWofz6nEYLW-tOBNG1suOPhqe3IzNFf4CmjnSIvJVoB4HrVRFgpuVrt0xNSB6XYz46hMLyuFErVtiX96gwMDaRIveNC4dEQoaiBj465LUT6FuCxGzR4vbmdBFO_46ngktwwkGvjFWeyw5ueXsVvteKUUO2hNWBMUIlHnPZJPJmMGKVlkI0iLrLOC1FmY9P2lC-pwveSRXTBNLu842HgFzpsX8A4nogSwJgDAqwc6mNHM3osZTaGyO7dNWzw7BI3kVt43Zp6oRwZPSdIavIIlzXWrC-9eozKt5S2cG0dU8o8xg0NDtNpl3eo0EZgON7QsuSTo8ofinzY",
          2016: "https://gateway.api.globalfishingwatch.org/v1/4wings/tile/heatmap/{z}/{x}/{y}?format=png&interval=10days&datasets[0]=public-global-fishing-effort:latest&filters[0]=geartype in ('tuna_purse_seines','driftnets','trollers','set_longlines','purse_seines','pots_and_traps','other_fishing','set_gillnets','fixed_gear','fishing','seiners','other_purse_seines','other_seines','squid_jigger','pole_and_line','drifting_longlines')&date-range=2016-01-01T00:00:00.000Z,2017-01-01T00:00:00.000Z&style=eyJjb2xvciI6WzI0MiwwLDEzN10sInJhbXAiOlswLDUxMTAuNjkxOTQ0NDQ0NDQzLDE5ODY2LjI0NDE2NjY2NjY2Nyw1MDg5OS44MjM2MTExMTExMiwxMjIxNzYuMDcyNzc3Nzc3NywyMjE3MDEuOTk4MzMzMzMzNTMsMzU4MDIxLjE0NzUwMDAwMDIsNTc2NzI0LjYyNzUwMDAwMDUsNzcxMDkwLjE4MjIyMjIyMTddfQ==&token=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImtpZEtleSJ9.eyJkYXRhIjp7Im5hbWUiOiI0d2luZ3MiLCJhcHBsaWNhdGlvbk5hbWUiOiJXUkkiLCJpZCI6MTIsInR5cGUiOiJhcHBsaWNhdGlvbiJ9LCJpYXQiOjE2Mjg3NTE0MDgsImV4cCI6MTc4NjQzMTQwOCwiYXVkIjoiZ2Z3IiwiaXNzIjoiZ2Z3In0.BDLq4f4kiAIuaHosOGXQW4Mo6bprxh50v6CataI61HZckiTJAcQ9iZ8SRZ8VENb1AoqiOHlrN4WcmeqwcH9ATN2US8IxxWhwKj87C7jYfJh2p9YU_D8JhVwtK4UAPS9LWFfnrXLCVIwo_QqZdKiwxoFwfJn2YEiO10JI4MRkDDuae0I38r1olbWofz6nEYLW-tOBNG1suOPhqe3IzNFf4CmjnSIvJVoB4HrVRFgpuVrt0xNSB6XYz46hMLyuFErVtiX96gwMDaRIveNC4dEQoaiBj465LUT6FuCxGzR4vbmdBFO_46ngktwwkGvjFWeyw5ueXsVvteKUUO2hNWBMUIlHnPZJPJmMGKVlkI0iLrLOC1FmY9P2lC-pwveSRXTBNLu842HgFzpsX8A4nogSwJgDAqwc6mNHM3osZTaGyO7dNWzw7BI3kVt43Zp6oRwZPSdIavIIlzXWrC-9eozKt5S2cG0dU8o8xg0NDtNpl3eo0EZgON7QsuSTo8ofinzY",
          2017: "https://gateway.api.globalfishingwatch.org/v1/4wings/tile/heatmap/{z}/{x}/{y}?format=png&interval=10days&datasets[0]=public-global-fishing-effort:latest&filters[0]=geartype in ('tuna_purse_seines','driftnets','trollers','set_longlines','purse_seines','pots_and_traps','other_fishing','set_gillnets','fixed_gear','fishing','seiners','other_purse_seines','other_seines','squid_jigger','pole_and_line','drifting_longlines')&date-range=2017-01-01T00:00:00.000Z,2018-01-01T00:00:00.000Z&style=eyJjb2xvciI6WzI0MiwwLDEzN10sInJhbXAiOlswLDQ1MDUuNTMzODg4ODg4ODg5LDE1ODY4Ljc3OTcyMjIyMjIyNSwzNjk0My4xOTU4MzMzMzMzNCw3ODE5OC41NTQxNjY2NjY2NywxNTkwOTYuNDkzODg4ODg4OTcsMjk0NDcyLjgwMTM4ODg4OTMsNDYyMzY0LjgyNzc3Nzc3NzcsNjgzMDYwLjA4MDI3Nzc3NzddfQ==&token=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImtpZEtleSJ9.eyJkYXRhIjp7Im5hbWUiOiI0d2luZ3MiLCJhcHBsaWNhdGlvbk5hbWUiOiJXUkkiLCJpZCI6MTIsInR5cGUiOiJhcHBsaWNhdGlvbiJ9LCJpYXQiOjE2Mjg3NTE0MDgsImV4cCI6MTc4NjQzMTQwOCwiYXVkIjoiZ2Z3IiwiaXNzIjoiZ2Z3In0.BDLq4f4kiAIuaHosOGXQW4Mo6bprxh50v6CataI61HZckiTJAcQ9iZ8SRZ8VENb1AoqiOHlrN4WcmeqwcH9ATN2US8IxxWhwKj87C7jYfJh2p9YU_D8JhVwtK4UAPS9LWFfnrXLCVIwo_QqZdKiwxoFwfJn2YEiO10JI4MRkDDuae0I38r1olbWofz6nEYLW-tOBNG1suOPhqe3IzNFf4CmjnSIvJVoB4HrVRFgpuVrt0xNSB6XYz46hMLyuFErVtiX96gwMDaRIveNC4dEQoaiBj465LUT6FuCxGzR4vbmdBFO_46ngktwwkGvjFWeyw5ueXsVvteKUUO2hNWBMUIlHnPZJPJmMGKVlkI0iLrLOC1FmY9P2lC-pwveSRXTBNLu842HgFzpsX8A4nogSwJgDAqwc6mNHM3osZTaGyO7dNWzw7BI3kVt43Zp6oRwZPSdIavIIlzXWrC-9eozKt5S2cG0dU8o8xg0NDtNpl3eo0EZgON7QsuSTo8ofinzY",
          2018: "https://gateway.api.globalfishingwatch.org/v1/4wings/tile/heatmap/{z}/{x}/{y}?format=png&interval=10days&datasets[0]=public-global-fishing-effort:latest&filters[0]=geartype in ('tuna_purse_seines','driftnets','trollers','set_longlines','purse_seines','pots_and_traps','other_fishing','set_gillnets','fixed_gear','fishing','seiners','other_purse_seines','other_seines','squid_jigger','pole_and_line','drifting_longlines')&date-range=2018-01-01T00:00:00.000Z,2019-01-01T00:00:00.000Z&style=eyJjb2xvciI6WzI0MiwwLDEzN10sInJhbXAiOlswLDQyOTguNjgwODMzMzMzMzM0LDE0NjAxLjEzNzUwMDAwMDAwNCwzMTQyNi4wMTg4ODg4ODg4ODgsNjAzMTMuNTIxNjY2NjY2NjQsMTI5MzIyLjI0NTI3Nzc3NzgxLDE5MTYyMS43NTgwNTU1NTU1NSwzOTQyODguNzg5NDQ0NDQ0LDY5NTQ5Mi4xNTgwNTU1NTU1XX0=&token=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImtpZEtleSJ9.eyJkYXRhIjp7Im5hbWUiOiI0d2luZ3MiLCJhcHBsaWNhdGlvbk5hbWUiOiJXUkkiLCJpZCI6MTIsInR5cGUiOiJhcHBsaWNhdGlvbiJ9LCJpYXQiOjE2Mjg3NTE0MDgsImV4cCI6MTc4NjQzMTQwOCwiYXVkIjoiZ2Z3IiwiaXNzIjoiZ2Z3In0.BDLq4f4kiAIuaHosOGXQW4Mo6bprxh50v6CataI61HZckiTJAcQ9iZ8SRZ8VENb1AoqiOHlrN4WcmeqwcH9ATN2US8IxxWhwKj87C7jYfJh2p9YU_D8JhVwtK4UAPS9LWFfnrXLCVIwo_QqZdKiwxoFwfJn2YEiO10JI4MRkDDuae0I38r1olbWofz6nEYLW-tOBNG1suOPhqe3IzNFf4CmjnSIvJVoB4HrVRFgpuVrt0xNSB6XYz46hMLyuFErVtiX96gwMDaRIveNC4dEQoaiBj465LUT6FuCxGzR4vbmdBFO_46ngktwwkGvjFWeyw5ueXsVvteKUUO2hNWBMUIlHnPZJPJmMGKVlkI0iLrLOC1FmY9P2lC-pwveSRXTBNLu842HgFzpsX8A4nogSwJgDAqwc6mNHM3osZTaGyO7dNWzw7BI3kVt43Zp6oRwZPSdIavIIlzXWrC-9eozKt5S2cG0dU8o8xg0NDtNpl3eo0EZgON7QsuSTo8ofinzY",
          2019: "https://gateway.api.globalfishingwatch.org/v1/4wings/tile/heatmap/{z}/{x}/{y}?format=png&interval=10days&datasets[0]=public-global-fishing-effort:latest&filters[0]=geartype in ('tuna_purse_seines','driftnets','trollers','set_longlines','purse_seines','pots_and_traps','other_fishing','set_gillnets','fixed_gear','fishing','seiners','other_purse_seines','other_seines','squid_jigger','pole_and_line','drifting_longlines')&date-range=2019-01-01T00:00:00.000Z,2020-01-01T00:00:00.000Z&style=eyJjb2xvciI6WzI0MiwwLDEzN10sInJhbXAiOlswLDYyMzAuMTA1NTU1NTU1NTU2LDIxNjE3Ljc0NjM4ODg4ODg4NSw1MTI5Ni4zOTIyMjIyMjIyMjUsMTE5OTU3LjE4MzA1NTU1NTYsMjE2MjgxLjM0NDE2NjY2NjgsNDI3OTE1LjI2ODg4ODg4OTEsNjQxMTc0LjQ4NDE2NjY2NjYsODA4NDE2LjcyMTk0NDQ0NTNdfQ==&token=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImtpZEtleSJ9.eyJkYXRhIjp7Im5hbWUiOiI0d2luZ3MiLCJhcHBsaWNhdGlvbk5hbWUiOiJXUkkiLCJpZCI6MTIsInR5cGUiOiJhcHBsaWNhdGlvbiJ9LCJpYXQiOjE2Mjg3NTE0MDgsImV4cCI6MTc4NjQzMTQwOCwiYXVkIjoiZ2Z3IiwiaXNzIjoiZ2Z3In0.BDLq4f4kiAIuaHosOGXQW4Mo6bprxh50v6CataI61HZckiTJAcQ9iZ8SRZ8VENb1AoqiOHlrN4WcmeqwcH9ATN2US8IxxWhwKj87C7jYfJh2p9YU_D8JhVwtK4UAPS9LWFfnrXLCVIwo_QqZdKiwxoFwfJn2YEiO10JI4MRkDDuae0I38r1olbWofz6nEYLW-tOBNG1suOPhqe3IzNFf4CmjnSIvJVoB4HrVRFgpuVrt0xNSB6XYz46hMLyuFErVtiX96gwMDaRIveNC4dEQoaiBj465LUT6FuCxGzR4vbmdBFO_46ngktwwkGvjFWeyw5ueXsVvteKUUO2hNWBMUIlHnPZJPJmMGKVlkI0iLrLOC1FmY9P2lC-pwveSRXTBNLu842HgFzpsX8A4nogSwJgDAqwc6mNHM3osZTaGyO7dNWzw7BI3kVt43Zp6oRwZPSdIavIIlzXWrC-9eozKt5S2cG0dU8o8xg0NDtNpl3eo0EZgON7QsuSTo8ofinzY",
          2020: "https://gateway.api.globalfishingwatch.org/v1/4wings/tile/heatmap/{z}/{x}/{y}?format=png&interval=10days&datasets[0]=public-global-fishing-effort:latest&filters[0]=geartype in ('tuna_purse_seines','driftnets','trollers','set_longlines','purse_seines','pots_and_traps','other_fishing','set_gillnets','fixed_gear','fishing','seiners','other_purse_seines','other_seines','squid_jigger','pole_and_line','drifting_longlines')&date-range=2020-01-01T00:00:00.000Z,2021-01-01T00:00:00.000Z&style=eyJjb2xvciI6WzI0MiwwLDEzN10sInJhbXAiOlswLDUwMDUuNTUwMzgwNTYwMDAxLDE3MjIyLjkyNjExMTExMTExMiw0MTk3NC4wNDYzODg4ODg4ODQsODgzMjQuMTE5ODQ5NzYzMDIsMTg5OTY3LjM0Nzc3Nzc3NzcsMzAyMzI4Ljg0Njk0NDQ0NDM1LDUwNjk0OS4xNTcyMjIyMjIyNSw3MTg2MjQuODM0MTY2NjY2OF19&token=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImtpZEtleSJ9.eyJkYXRhIjp7Im5hbWUiOiI0d2luZ3MiLCJhcHBsaWNhdGlvbk5hbWUiOiJXUkkiLCJpZCI6MTIsInR5cGUiOiJhcHBsaWNhdGlvbiJ9LCJpYXQiOjE2Mjg3NTE0MDgsImV4cCI6MTc4NjQzMTQwOCwiYXVkIjoiZ2Z3IiwiaXNzIjoiZ2Z3In0.BDLq4f4kiAIuaHosOGXQW4Mo6bprxh50v6CataI61HZckiTJAcQ9iZ8SRZ8VENb1AoqiOHlrN4WcmeqwcH9ATN2US8IxxWhwKj87C7jYfJh2p9YU_D8JhVwtK4UAPS9LWFfnrXLCVIwo_QqZdKiwxoFwfJn2YEiO10JI4MRkDDuae0I38r1olbWofz6nEYLW-tOBNG1suOPhqe3IzNFf4CmjnSIvJVoB4HrVRFgpuVrt0xNSB6XYz46hMLyuFErVtiX96gwMDaRIveNC4dEQoaiBj465LUT6FuCxGzR4vbmdBFO_46ngktwwkGvjFWeyw5ueXsVvteKUUO2hNWBMUIlHnPZJPJmMGKVlkI0iLrLOC1FmY9P2lC-pwveSRXTBNLu842HgFzpsX8A4nogSwJgDAqwc6mNHM3osZTaGyO7dNWzw7BI3kVt43Zp6oRwZPSdIavIIlzXWrC-9eozKt5S2cG0dU8o8xg0NDtNpl3eo0EZgON7QsuSTo8ofinzY",
          2021: "https://gateway.api.globalfishingwatch.org/v1/4wings/tile/heatmap/{z}/{x}/{y}?format=png&interval=10days&datasets[0]=public-global-fishing-effort:latest&filters[0]=geartype in ('tuna_purse_seines','driftnets','trollers','set_longlines','purse_seines','pots_and_traps','other_fishing','set_gillnets','fixed_gear','fishing','seiners','other_purse_seines','other_seines','squid_jigger','pole_and_line','drifting_longlines')&date-range=2021-01-01T00:00:00.000Z,2022-01-01T00:00:00.000Z&style=eyJjb2xvciI6WzI0MiwwLDEzN10sInJhbXAiOlswLDM3NTkuNTgyNjk0NTc4NjExLDEzMTUwLjA4MjE4MTY5Nzc4LDMyNDYyLjkzNTE0OTg5MDI5OCw2NjQ4MS43MjgzOTU3MTgzNSwxMzI5MjEuMzQyNzYzODg5MTQsMjEyODI0LjA5NDg5NzIyMTgzLDMzNzM3My42NTgwMDAwMDAwNSw0NDg5MjEuNDM1MzgwNTU2NF19&token=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImtpZEtleSJ9.eyJkYXRhIjp7Im5hbWUiOiI0d2luZ3MiLCJhcHBsaWNhdGlvbk5hbWUiOiJXUkkiLCJpZCI6MTIsInR5cGUiOiJhcHBsaWNhdGlvbiJ9LCJpYXQiOjE2Mjg3NTE0MDgsImV4cCI6MTc4NjQzMTQwOCwiYXVkIjoiZ2Z3IiwiaXNzIjoiZ2Z3In0.BDLq4f4kiAIuaHosOGXQW4Mo6bprxh50v6CataI61HZckiTJAcQ9iZ8SRZ8VENb1AoqiOHlrN4WcmeqwcH9ATN2US8IxxWhwKj87C7jYfJh2p9YU_D8JhVwtK4UAPS9LWFfnrXLCVIwo_QqZdKiwxoFwfJn2YEiO10JI4MRkDDuae0I38r1olbWofz6nEYLW-tOBNG1suOPhqe3IzNFf4CmjnSIvJVoB4HrVRFgpuVrt0xNSB6XYz46hMLyuFErVtiX96gwMDaRIveNC4dEQoaiBj465LUT6FuCxGzR4vbmdBFO_46ngktwwkGvjFWeyw5ueXsVvteKUUO2hNWBMUIlHnPZJPJmMGKVlkI0iLrLOC1FmY9P2lC-pwveSRXTBNLu842HgFzpsX8A4nogSwJgDAqwc6mNHM3osZTaGyO7dNWzw7BI3kVt43Zp6oRwZPSdIavIIlzXWrC-9eozKt5S2cG0dU8o8xg0NDtNpl3eo0EZgON7QsuSTo8ofinzY",
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
          name: 'Fishing effort',
          color: '#f20089',
        },
      ],
      timeline: {
        step: 1,
        interval: 'years',
        range: false,
        dateFormat: 'YYYY',
        minDate: '2012-01-01',
        maxDate: '2021-01-01',
      },
    },
  },
  'trawling-activity': {
    label: 'Trawling activity',
    attributions: ['rw', 'global-fishing-watch'],
    group: 'oceans',
    config: {
      type: 'raster',
      source: (year = 2021) => {
        const yearToTiles = {
          2012: "https://gateway.api.globalfishingwatch.org/v1/4wings/tile/heatmap/{z}/{x}/{y}?format=png&interval=10days&datasets[0]=public-global-fishing-effort:latest&filters[0]=geartype in ('dredge_fishing','trawlers')&date-range=2012-01-01T00:00:00.000Z,2013-01-01T00:00:00.000Z&style=eyJjb2xvciI6WzI1NSw2Myw1Ml0sInJhbXAiOlswLDE2NzAuMTkxOTQ0NDQ0NDQ0Myw1NTQwLjYxMzg4ODg4ODg4OSwxMDU3MS43MjQ0NDQ0NDQ0NDYsMTc3OTAuMzAzMzMzMzMzMzMzLDI3MzE0LjU3MjQ5OTk5OTk5NSw0MjM5Mi4wMDg2MTExMTExMSw4MTI2OS4yNTk0NDQ0NDQ1LDEwMzk1OC45MTg4ODg4ODg5XX0=&token=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImtpZEtleSJ9.eyJkYXRhIjp7Im5hbWUiOiI0d2luZ3MiLCJhcHBsaWNhdGlvbk5hbWUiOiJXUkkiLCJpZCI6MTIsInR5cGUiOiJhcHBsaWNhdGlvbiJ9LCJpYXQiOjE2Mjg3NTE0MDgsImV4cCI6MTc4NjQzMTQwOCwiYXVkIjoiZ2Z3IiwiaXNzIjoiZ2Z3In0.BDLq4f4kiAIuaHosOGXQW4Mo6bprxh50v6CataI61HZckiTJAcQ9iZ8SRZ8VENb1AoqiOHlrN4WcmeqwcH9ATN2US8IxxWhwKj87C7jYfJh2p9YU_D8JhVwtK4UAPS9LWFfnrXLCVIwo_QqZdKiwxoFwfJn2YEiO10JI4MRkDDuae0I38r1olbWofz6nEYLW-tOBNG1suOPhqe3IzNFf4CmjnSIvJVoB4HrVRFgpuVrt0xNSB6XYz46hMLyuFErVtiX96gwMDaRIveNC4dEQoaiBj465LUT6FuCxGzR4vbmdBFO_46ngktwwkGvjFWeyw5ueXsVvteKUUO2hNWBMUIlHnPZJPJmMGKVlkI0iLrLOC1FmY9P2lC-pwveSRXTBNLu842HgFzpsX8A4nogSwJgDAqwc6mNHM3osZTaGyO7dNWzw7BI3kVt43Zp6oRwZPSdIavIIlzXWrC-9eozKt5S2cG0dU8o8xg0NDtNpl3eo0EZgON7QsuSTo8ofinzY",
          2013: "https://gateway.api.globalfishingwatch.org/v1/4wings/tile/heatmap/{z}/{x}/{y}?format=png&interval=10days&datasets[0]=public-global-fishing-effort:latest&filters[0]=geartype in ('dredge_fishing','trawlers')&date-range=2013-01-01T00:00:00.000Z,2014-01-01T00:00:00.000Z&style=eyJjb2xvciI6WzI1NSw2Myw1Ml0sInJhbXAiOlswLDY3MzUuMjY0OTk5OTk5OTk5LDIzNDE1LjAzODg4ODg4ODksNTMxNTIuOTU2MTExMTExMTMsMTA2Mjc1LjY5MzYxMTExMTEzLDE1NTM4Ny4xODcyMjIyMjIyLDIxNjcxMS44ODI0OTk5OTk4MywzMDAwMDguOTgwNTU1NTU1Miw0ODE5MzUuOTUzMzMzMzM0OF19&token=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImtpZEtleSJ9.eyJkYXRhIjp7Im5hbWUiOiI0d2luZ3MiLCJhcHBsaWNhdGlvbk5hbWUiOiJXUkkiLCJpZCI6MTIsInR5cGUiOiJhcHBsaWNhdGlvbiJ9LCJpYXQiOjE2Mjg3NTE0MDgsImV4cCI6MTc4NjQzMTQwOCwiYXVkIjoiZ2Z3IiwiaXNzIjoiZ2Z3In0.BDLq4f4kiAIuaHosOGXQW4Mo6bprxh50v6CataI61HZckiTJAcQ9iZ8SRZ8VENb1AoqiOHlrN4WcmeqwcH9ATN2US8IxxWhwKj87C7jYfJh2p9YU_D8JhVwtK4UAPS9LWFfnrXLCVIwo_QqZdKiwxoFwfJn2YEiO10JI4MRkDDuae0I38r1olbWofz6nEYLW-tOBNG1suOPhqe3IzNFf4CmjnSIvJVoB4HrVRFgpuVrt0xNSB6XYz46hMLyuFErVtiX96gwMDaRIveNC4dEQoaiBj465LUT6FuCxGzR4vbmdBFO_46ngktwwkGvjFWeyw5ueXsVvteKUUO2hNWBMUIlHnPZJPJmMGKVlkI0iLrLOC1FmY9P2lC-pwveSRXTBNLu842HgFzpsX8A4nogSwJgDAqwc6mNHM3osZTaGyO7dNWzw7BI3kVt43Zp6oRwZPSdIavIIlzXWrC-9eozKt5S2cG0dU8o8xg0NDtNpl3eo0EZgON7QsuSTo8ofinzY",
          2014: "https://gateway.api.globalfishingwatch.org/v1/4wings/tile/heatmap/{z}/{x}/{y}?format=png&interval=10days&datasets[0]=public-global-fishing-effort:latest&filters[0]=geartype in ('dredge_fishing','trawlers')&date-range=2014-01-01T00:00:00.000Z,2015-01-01T00:00:00.000Z&style=eyJjb2xvciI6WzI1NSw2Myw1Ml0sInJhbXAiOlswLDY3ODcuNzAxMTExMTExMTExNSwyNTEzMC40MjcyMjIyMjIyMjQsNjMzMTUuMzk2OTQ0NDQ0NDQsMTIzNDAyLjk1MzA1NTU1NTYxLDIwMTY5Ny4wMDExMTExMTExLDMwMjYzMy45NjYxMTExMTEsNTQ4Njg5LjUxNDk5OTk5OTgsNzc5NjE0LjIyMjIyMjIyMzFdfQ==&token=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImtpZEtleSJ9.eyJkYXRhIjp7Im5hbWUiOiI0d2luZ3MiLCJhcHBsaWNhdGlvbk5hbWUiOiJXUkkiLCJpZCI6MTIsInR5cGUiOiJhcHBsaWNhdGlvbiJ9LCJpYXQiOjE2Mjg3NTE0MDgsImV4cCI6MTc4NjQzMTQwOCwiYXVkIjoiZ2Z3IiwiaXNzIjoiZ2Z3In0.BDLq4f4kiAIuaHosOGXQW4Mo6bprxh50v6CataI61HZckiTJAcQ9iZ8SRZ8VENb1AoqiOHlrN4WcmeqwcH9ATN2US8IxxWhwKj87C7jYfJh2p9YU_D8JhVwtK4UAPS9LWFfnrXLCVIwo_QqZdKiwxoFwfJn2YEiO10JI4MRkDDuae0I38r1olbWofz6nEYLW-tOBNG1suOPhqe3IzNFf4CmjnSIvJVoB4HrVRFgpuVrt0xNSB6XYz46hMLyuFErVtiX96gwMDaRIveNC4dEQoaiBj465LUT6FuCxGzR4vbmdBFO_46ngktwwkGvjFWeyw5ueXsVvteKUUO2hNWBMUIlHnPZJPJmMGKVlkI0iLrLOC1FmY9P2lC-pwveSRXTBNLu842HgFzpsX8A4nogSwJgDAqwc6mNHM3osZTaGyO7dNWzw7BI3kVt43Zp6oRwZPSdIavIIlzXWrC-9eozKt5S2cG0dU8o8xg0NDtNpl3eo0EZgON7QsuSTo8ofinzY",
          2015: "https://gateway.api.globalfishingwatch.org/v1/4wings/tile/heatmap/{z}/{x}/{y}?format=png&interval=10days&datasets[0]=public-global-fishing-effort:latest&filters[0]=geartype in ('dredge_fishing','trawlers')&date-range=2015-01-01T00:00:00.000Z,2016-01-01T00:00:00.000Z&style=eyJjb2xvciI6WzI1NSw2Myw1Ml0sInJhbXAiOlswLDEzODkxLjI3NzUsNDk4ODEuNjIyNTAwMDAwMDM0LDExMzI1MC4zMTY5NDQ0NDQ1LDE4NTA1My43NTk3MjIyMjIyOCwyODgxMTIuMjgxMTExMTExMSw0MTg2NTcuMTY0NzIyMjIxODUsNjI1MDQwLjE3ODA1NTU1NDksNzU0MTg0Ljk4MTM4ODg4NzZdfQ==&token=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImtpZEtleSJ9.eyJkYXRhIjp7Im5hbWUiOiI0d2luZ3MiLCJhcHBsaWNhdGlvbk5hbWUiOiJXUkkiLCJpZCI6MTIsInR5cGUiOiJhcHBsaWNhdGlvbiJ9LCJpYXQiOjE2Mjg3NTE0MDgsImV4cCI6MTc4NjQzMTQwOCwiYXVkIjoiZ2Z3IiwiaXNzIjoiZ2Z3In0.BDLq4f4kiAIuaHosOGXQW4Mo6bprxh50v6CataI61HZckiTJAcQ9iZ8SRZ8VENb1AoqiOHlrN4WcmeqwcH9ATN2US8IxxWhwKj87C7jYfJh2p9YU_D8JhVwtK4UAPS9LWFfnrXLCVIwo_QqZdKiwxoFwfJn2YEiO10JI4MRkDDuae0I38r1olbWofz6nEYLW-tOBNG1suOPhqe3IzNFf4CmjnSIvJVoB4HrVRFgpuVrt0xNSB6XYz46hMLyuFErVtiX96gwMDaRIveNC4dEQoaiBj465LUT6FuCxGzR4vbmdBFO_46ngktwwkGvjFWeyw5ueXsVvteKUUO2hNWBMUIlHnPZJPJmMGKVlkI0iLrLOC1FmY9P2lC-pwveSRXTBNLu842HgFzpsX8A4nogSwJgDAqwc6mNHM3osZTaGyO7dNWzw7BI3kVt43Zp6oRwZPSdIavIIlzXWrC-9eozKt5S2cG0dU8o8xg0NDtNpl3eo0EZgON7QsuSTo8ofinzY",
          2016: "https://gateway.api.globalfishingwatch.org/v1/4wings/tile/heatmap/{z}/{x}/{y}?format=png&interval=10days&datasets[0]=public-global-fishing-effort:latest&filters[0]=geartype in ('dredge_fishing','trawlers')&date-range=2016-01-01T00:00:00.000Z,2017-01-01T00:00:00.000Z&style=eyJjb2xvciI6WzI1NSw2Myw1Ml0sInJhbXAiOlswLDgyMzIuOTgzNjExMTExMTEsMjc2MzEuOTcwNTU1NTU1NTYsNjA5MzguMzY1NTU1NTU1NiwxNDEzOTYuOTQzMDU1NTU1NTIsMjMzNDUwLjA5ODYxMTExMSwzODg0MjcuOTY0NDQ0NDQ0OCw1MTYxOTIuMjY2OTQ0NDQ0NSw5NTgzNzguMTAyMjIyMjIwNl19&token=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImtpZEtleSJ9.eyJkYXRhIjp7Im5hbWUiOiI0d2luZ3MiLCJhcHBsaWNhdGlvbk5hbWUiOiJXUkkiLCJpZCI6MTIsInR5cGUiOiJhcHBsaWNhdGlvbiJ9LCJpYXQiOjE2Mjg3NTE0MDgsImV4cCI6MTc4NjQzMTQwOCwiYXVkIjoiZ2Z3IiwiaXNzIjoiZ2Z3In0.BDLq4f4kiAIuaHosOGXQW4Mo6bprxh50v6CataI61HZckiTJAcQ9iZ8SRZ8VENb1AoqiOHlrN4WcmeqwcH9ATN2US8IxxWhwKj87C7jYfJh2p9YU_D8JhVwtK4UAPS9LWFfnrXLCVIwo_QqZdKiwxoFwfJn2YEiO10JI4MRkDDuae0I38r1olbWofz6nEYLW-tOBNG1suOPhqe3IzNFf4CmjnSIvJVoB4HrVRFgpuVrt0xNSB6XYz46hMLyuFErVtiX96gwMDaRIveNC4dEQoaiBj465LUT6FuCxGzR4vbmdBFO_46ngktwwkGvjFWeyw5ueXsVvteKUUO2hNWBMUIlHnPZJPJmMGKVlkI0iLrLOC1FmY9P2lC-pwveSRXTBNLu842HgFzpsX8A4nogSwJgDAqwc6mNHM3osZTaGyO7dNWzw7BI3kVt43Zp6oRwZPSdIavIIlzXWrC-9eozKt5S2cG0dU8o8xg0NDtNpl3eo0EZgON7QsuSTo8ofinzY",
          2017: "https://gateway.api.globalfishingwatch.org/v1/4wings/tile/heatmap/{z}/{x}/{y}?format=png&interval=10days&datasets[0]=public-global-fishing-effort:latest&filters[0]=geartype in ('dredge_fishing','trawlers')&date-range=2017-01-01T00:00:00.000Z,2018-01-01T00:00:00.000Z&style=eyJjb2xvciI6WzI1NSw2Myw1Ml0sInJhbXAiOlswLDEyNzc5LjkwNTU1NTU1NTU1NSw0NzExNi40MTgwNTU1NTU1NSwxMTA2MDEuOTYyNTAwMDAwMDEsMjAwOTQwLjM1NjExMTExMTEsMzA3NDQxLjYyMTM4ODg4ODksNDMxMTUxLjM4Nzc3Nzc3NzMzLDY2MzYzMi4wNzkxNjY2Njg3LDEwNjM1OTMuNDM4MzMzMzMzXX0=&token=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImtpZEtleSJ9.eyJkYXRhIjp7Im5hbWUiOiI0d2luZ3MiLCJhcHBsaWNhdGlvbk5hbWUiOiJXUkkiLCJpZCI6MTIsInR5cGUiOiJhcHBsaWNhdGlvbiJ9LCJpYXQiOjE2Mjg3NTE0MDgsImV4cCI6MTc4NjQzMTQwOCwiYXVkIjoiZ2Z3IiwiaXNzIjoiZ2Z3In0.BDLq4f4kiAIuaHosOGXQW4Mo6bprxh50v6CataI61HZckiTJAcQ9iZ8SRZ8VENb1AoqiOHlrN4WcmeqwcH9ATN2US8IxxWhwKj87C7jYfJh2p9YU_D8JhVwtK4UAPS9LWFfnrXLCVIwo_QqZdKiwxoFwfJn2YEiO10JI4MRkDDuae0I38r1olbWofz6nEYLW-tOBNG1suOPhqe3IzNFf4CmjnSIvJVoB4HrVRFgpuVrt0xNSB6XYz46hMLyuFErVtiX96gwMDaRIveNC4dEQoaiBj465LUT6FuCxGzR4vbmdBFO_46ngktwwkGvjFWeyw5ueXsVvteKUUO2hNWBMUIlHnPZJPJmMGKVlkI0iLrLOC1FmY9P2lC-pwveSRXTBNLu842HgFzpsX8A4nogSwJgDAqwc6mNHM3osZTaGyO7dNWzw7BI3kVt43Zp6oRwZPSdIavIIlzXWrC-9eozKt5S2cG0dU8o8xg0NDtNpl3eo0EZgON7QsuSTo8ofinzY",
          2018: "https://gateway.api.globalfishingwatch.org/v1/4wings/tile/heatmap/{z}/{x}/{y}?format=png&interval=10days&datasets[0]=public-global-fishing-effort:latest&filters[0]=geartype in ('dredge_fishing','trawlers')&date-range=2018-01-01T00:00:00.000Z,2019-01-01T00:00:00.000Z&style=eyJjb2xvciI6WzI1NSw2Myw1Ml0sInJhbXAiOlswLDExMzg3LjIyODMzMzMzMzMzNCw0MjI3MS4zOTk3MjIyMjIyMSw5MDk5OS40MTYxMTExMTExMiwxNzMzNDguMDIzODg4ODg4OCwzMzUxNTUuMDAzMDU1NTU1Nyw1MjgzNjYuOTA1ODMzMzMzMyw4NjA5NTYuOTc3Nzc3Nzc4NiwxMDUyMjc5LjI3MDI3Nzc3OTVdfQ==&token=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImtpZEtleSJ9.eyJkYXRhIjp7Im5hbWUiOiI0d2luZ3MiLCJhcHBsaWNhdGlvbk5hbWUiOiJXUkkiLCJpZCI6MTIsInR5cGUiOiJhcHBsaWNhdGlvbiJ9LCJpYXQiOjE2Mjg3NTE0MDgsImV4cCI6MTc4NjQzMTQwOCwiYXVkIjoiZ2Z3IiwiaXNzIjoiZ2Z3In0.BDLq4f4kiAIuaHosOGXQW4Mo6bprxh50v6CataI61HZckiTJAcQ9iZ8SRZ8VENb1AoqiOHlrN4WcmeqwcH9ATN2US8IxxWhwKj87C7jYfJh2p9YU_D8JhVwtK4UAPS9LWFfnrXLCVIwo_QqZdKiwxoFwfJn2YEiO10JI4MRkDDuae0I38r1olbWofz6nEYLW-tOBNG1suOPhqe3IzNFf4CmjnSIvJVoB4HrVRFgpuVrt0xNSB6XYz46hMLyuFErVtiX96gwMDaRIveNC4dEQoaiBj465LUT6FuCxGzR4vbmdBFO_46ngktwwkGvjFWeyw5ueXsVvteKUUO2hNWBMUIlHnPZJPJmMGKVlkI0iLrLOC1FmY9P2lC-pwveSRXTBNLu842HgFzpsX8A4nogSwJgDAqwc6mNHM3osZTaGyO7dNWzw7BI3kVt43Zp6oRwZPSdIavIIlzXWrC-9eozKt5S2cG0dU8o8xg0NDtNpl3eo0EZgON7QsuSTo8ofinzY",
          2019: "https://gateway.api.globalfishingwatch.org/v1/4wings/tile/heatmap/{z}/{x}/{y}?format=png&interval=10days&datasets[0]=public-global-fishing-effort:latest&filters[0]=geartype in ('dredge_fishing','trawlers')&date-range=2019-01-01T00:00:00.000Z,2020-01-01T00:00:00.000Z&style=eyJjb2xvciI6WzI1NSw2Myw1Ml0sInJhbXAiOlswLDExNzY2LjgxMjc3Nzc3Nzc3OSw0MzQ0Mi4yNTc0OTk5OTk5OSw5NDkxMC4wMTM4ODg4ODg4OSwxOTE0MjkuNDQyNDk5OTk5OTUsMzM4NzE0LjExNTU1NTU1NTQsNTI5NDE5Ljg2MTY2NjY2Niw5ODg2OTAuNTY1Mjc3Nzc3OCwxMTgzMjU1LjQwNjY2NjY3MDJdfQ==&token=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImtpZEtleSJ9.eyJkYXRhIjp7Im5hbWUiOiI0d2luZ3MiLCJhcHBsaWNhdGlvbk5hbWUiOiJXUkkiLCJpZCI6MTIsInR5cGUiOiJhcHBsaWNhdGlvbiJ9LCJpYXQiOjE2Mjg3NTE0MDgsImV4cCI6MTc4NjQzMTQwOCwiYXVkIjoiZ2Z3IiwiaXNzIjoiZ2Z3In0.BDLq4f4kiAIuaHosOGXQW4Mo6bprxh50v6CataI61HZckiTJAcQ9iZ8SRZ8VENb1AoqiOHlrN4WcmeqwcH9ATN2US8IxxWhwKj87C7jYfJh2p9YU_D8JhVwtK4UAPS9LWFfnrXLCVIwo_QqZdKiwxoFwfJn2YEiO10JI4MRkDDuae0I38r1olbWofz6nEYLW-tOBNG1suOPhqe3IzNFf4CmjnSIvJVoB4HrVRFgpuVrt0xNSB6XYz46hMLyuFErVtiX96gwMDaRIveNC4dEQoaiBj465LUT6FuCxGzR4vbmdBFO_46ngktwwkGvjFWeyw5ueXsVvteKUUO2hNWBMUIlHnPZJPJmMGKVlkI0iLrLOC1FmY9P2lC-pwveSRXTBNLu842HgFzpsX8A4nogSwJgDAqwc6mNHM3osZTaGyO7dNWzw7BI3kVt43Zp6oRwZPSdIavIIlzXWrC-9eozKt5S2cG0dU8o8xg0NDtNpl3eo0EZgON7QsuSTo8ofinzY",
          2020: "https://gateway.api.globalfishingwatch.org/v1/4wings/tile/heatmap/{z}/{x}/{y}?format=png&interval=10days&datasets[0]=public-global-fishing-effort:latest&filters[0]=geartype in ('dredge_fishing','trawlers')&date-range=2020-01-01T00:00:00.000Z,2021-01-01T00:00:00.000Z&style=eyJjb2xvciI6WzI1NSw2Myw1Ml0sInJhbXAiOlswLDEwOTI2Ljc3MzA1NTU1NTU1Nyw0MTY2Mi4zNTc4NDIxNTc0OSw5Mzc1Mi43Mzc1MDAwMDAwMiwxODQ1MzkuMDI1NTU1NTU1NTMsMzcyNDMzLjk1Njk0NDQ0NDcsNzAxMzcwLjYxNTAwMDAwMTYsOTA5OTM1LjM1NTgzMzMzNTEsMTEwMTg5Mi44NDQ0NDQ0NDMyXX0=&token=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImtpZEtleSJ9.eyJkYXRhIjp7Im5hbWUiOiI0d2luZ3MiLCJhcHBsaWNhdGlvbk5hbWUiOiJXUkkiLCJpZCI6MTIsInR5cGUiOiJhcHBsaWNhdGlvbiJ9LCJpYXQiOjE2Mjg3NTE0MDgsImV4cCI6MTc4NjQzMTQwOCwiYXVkIjoiZ2Z3IiwiaXNzIjoiZ2Z3In0.BDLq4f4kiAIuaHosOGXQW4Mo6bprxh50v6CataI61HZckiTJAcQ9iZ8SRZ8VENb1AoqiOHlrN4WcmeqwcH9ATN2US8IxxWhwKj87C7jYfJh2p9YU_D8JhVwtK4UAPS9LWFfnrXLCVIwo_QqZdKiwxoFwfJn2YEiO10JI4MRkDDuae0I38r1olbWofz6nEYLW-tOBNG1suOPhqe3IzNFf4CmjnSIvJVoB4HrVRFgpuVrt0xNSB6XYz46hMLyuFErVtiX96gwMDaRIveNC4dEQoaiBj465LUT6FuCxGzR4vbmdBFO_46ngktwwkGvjFWeyw5ueXsVvteKUUO2hNWBMUIlHnPZJPJmMGKVlkI0iLrLOC1FmY9P2lC-pwveSRXTBNLu842HgFzpsX8A4nogSwJgDAqwc6mNHM3osZTaGyO7dNWzw7BI3kVt43Zp6oRwZPSdIavIIlzXWrC-9eozKt5S2cG0dU8o8xg0NDtNpl3eo0EZgON7QsuSTo8ofinzY",
          2021: "https://gateway.api.globalfishingwatch.org/v1/4wings/tile/heatmap/{z}/{x}/{y}?format=png&interval=10days&datasets[0]=public-global-fishing-effort:latest&filters[0]=geartype in ('dredge_fishing','trawlers')&date-range=2021-01-01T00:00:00.000Z,2022-01-01T00:00:00.000Z&style=eyJjb2xvciI6WzI1NSw2Myw1Ml0sInJhbXAiOlswLDU1NzkuNjAyMjI2MTcwNTU1LDIwMDU0LjQ3MTExMTExMTEwMyw0MTY2Ni44NDI1NjQ5OTE5Nyw3MjU5Ni40ODUzNjIzNzUwNSwxMzMzMTMuODc0NDQxMDY4MSwxOTc3ODEuNjMwMTUzNDI5MSwzMzYyMzUuNjYzODg4ODg4NjcsMzk5ODI5LjY3ODA2MTExMThdfQ==&token=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImtpZEtleSJ9.eyJkYXRhIjp7Im5hbWUiOiI0d2luZ3MiLCJhcHBsaWNhdGlvbk5hbWUiOiJXUkkiLCJpZCI6MTIsInR5cGUiOiJhcHBsaWNhdGlvbiJ9LCJpYXQiOjE2Mjg3NTE0MDgsImV4cCI6MTc4NjQzMTQwOCwiYXVkIjoiZ2Z3IiwiaXNzIjoiZ2Z3In0.BDLq4f4kiAIuaHosOGXQW4Mo6bprxh50v6CataI61HZckiTJAcQ9iZ8SRZ8VENb1AoqiOHlrN4WcmeqwcH9ATN2US8IxxWhwKj87C7jYfJh2p9YU_D8JhVwtK4UAPS9LWFfnrXLCVIwo_QqZdKiwxoFwfJn2YEiO10JI4MRkDDuae0I38r1olbWofz6nEYLW-tOBNG1suOPhqe3IzNFf4CmjnSIvJVoB4HrVRFgpuVrt0xNSB6XYz46hMLyuFErVtiX96gwMDaRIveNC4dEQoaiBj465LUT6FuCxGzR4vbmdBFO_46ngktwwkGvjFWeyw5ueXsVvteKUUO2hNWBMUIlHnPZJPJmMGKVlkI0iLrLOC1FmY9P2lC-pwveSRXTBNLu842HgFzpsX8A4nogSwJgDAqwc6mNHM3osZTaGyO7dNWzw7BI3kVt43Zp6oRwZPSdIavIIlzXWrC-9eozKt5S2cG0dU8o8xg0NDtNpl3eo0EZgON7QsuSTo8ofinzY",
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
          name: 'Fishing effort',
          color: '#ff3f34',
        },
      ],
      timeline: {
        step: 1,
        interval: 'years',
        range: false,
        dateFormat: 'YYYY',
        minDate: '2012-01-01',
        maxDate: '2021-01-01',
      },
    },
  },
  'human-impacts-on-oceans': {
    label: 'Human impacts on oceans',
    attributions: ['rw'],
    group: 'oceans',
    config: {
      type: 'raster',
      source: {
        tiles: [
          'https://api.resourcewatch.org/v1/layer/51785548-87b5-4c3b-b7a7-7d63258b4f91/tile/gee/{z}/{x}/{y}',
        ],
        minzoom: 2,
        maxzoom: 12,
      },
    },
    legend: {
      type: 'basic',
      items: [
        {
          color: '#fcae91',
          name: 'High Impact Likely',
        },
        {
          color: '#cb181d',
          name: 'High Impact Very Likely',
        },
      ],
    },
  },
  'maritime-boundaries': {
    label: 'Maritime boundaries',
    attributions: ['rw'],
    group: 'oceans',
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
                sql:
                  "SELECT * FROM com_011_rw1_maritime_boundaries_edit WHERE pol_type NOT IN ('12NM','24NM')",
              },
              type: 'cartodb',
            },
          ],
        },
      },
      render: {
        layers: [
          {
            id: 'maritime-boundaries-1',
            paint: {
              'fill-color': ' #374C70',
              'fill-opacity': VECTOR_LAYERS_FILL_OPACITY,
            },
            'source-layer': 'layer0',
            type: 'fill',
            filter: ['all'],
          },
          {
            paint: {
              'line-width': 1,
              'line-opacity': 1,
              'line-color': ' #374C70',
            },
            'source-layer': 'layer0',
            type: 'line',
            filter: ['all'],
          },
        ],
      },
      interactiveLayerIds: ['maritime-boundaries-1'],
      interactiveFeatureFormat: properties => ({
        Territory: properties.territory1,
        Sovereignty: properties.sovereign1,
        'Boundary Type': properties.pol_type,
      }),
    },
    legend: {
      type: 'basic',
      items: [
        {
          name: 'Exclusive Economic Zones (200 NM)',
          color: '#374C70',
        },
      ],
    },
  },
  'annual-surface-water-coverage': {
    label: 'Annual surface water coverage',
    attributions: ['rw'],
    group: 'oceans',
    config: {
      type: 'raster',
      source: (year = 2020) => {
        const yearToTiles = {
          1984: 'https://api.resourcewatch.org/v1/layer/2bb0e9ea-1cf6-4c40-aa47-04c77ca39175/tile/gee/{z}/{x}/{y}',
          1985: 'https://api.resourcewatch.org/v1/layer/fc2e05af-77f7-4349-b220-c8a067a8b36b/tile/gee/{z}/{x}/{y}',
          1986: 'https://api.resourcewatch.org/v1/layer/6a6f57a2-4189-41e1-9a18-9cea24a564cd/tile/gee/{z}/{x}/{y}',
          1987: 'https://api.resourcewatch.org/v1/layer/68c80328-e1a2-4b21-ae7f-163bc28212c2/tile/gee/{z}/{x}/{y}',
          1988: 'https://api.resourcewatch.org/v1/layer/a566f117-e2c4-4296-b1f7-9d799300207f/tile/gee/{z}/{x}/{y}',
          1989: 'https://api.resourcewatch.org/v1/layer/75a3a0a0-d0fc-4f9d-92e2-936ce82a8f1f/tile/gee/{z}/{x}/{y}',
          1990: 'https://api.resourcewatch.org/v1/layer/8ba5b22e-0f95-4507-981a-b13b9e870efd/tile/gee/{z}/{x}/{y}',
          1991: 'https://api.resourcewatch.org/v1/layer/245d5de6-e2e3-465c-b796-a9e2f9e9a679/tile/gee/{z}/{x}/{y}',
          1992: 'https://api.resourcewatch.org/v1/layer/f9142436-952d-48b1-a29c-786f59afb91b/tile/gee/{z}/{x}/{y}',
          1993: 'https://api.resourcewatch.org/v1/layer/82216b66-037b-413e-9c8c-237b15d2b18c/tile/gee/{z}/{x}/{y}',
          1994: 'https://api.resourcewatch.org/v1/layer/c9c57648-21bd-4e9d-b3f5-f08ae4cfa4bc/tile/gee/{z}/{x}/{y}',
          1995: 'https://api.resourcewatch.org/v1/layer/e4109eaf-bb71-4347-9002-7e22ce858e21/tile/gee/{z}/{x}/{y}',
          1996: 'https://api.resourcewatch.org/v1/layer/097dd717-a63c-404e-8b5c-c1b96f425043/tile/gee/{z}/{x}/{y}',
          1997: 'https://api.resourcewatch.org/v1/layer/fad94804-9e63-43bc-91ef-bdaebbc31469/tile/gee/{z}/{x}/{y}',
          1998: 'https://api.resourcewatch.org/v1/layer/21816805-4883-4f49-bad7-08fbe84e0895/tile/gee/{z}/{x}/{y}',
          1999: 'https://api.resourcewatch.org/v1/layer/653877b6-d977-4438-a51f-194c53a02dfe/tile/gee/{z}/{x}/{y}',
          2000: 'https://api.resourcewatch.org/v1/layer/c1ea7564-3ef1-43f6-b89c-2ec411a89637/tile/gee/{z}/{x}/{y}',
          2001: 'https://api.resourcewatch.org/v1/layer/3005a413-16d7-4fe6-9482-f7715ff15f93/tile/gee/{z}/{x}/{y}',
          2002: 'https://api.resourcewatch.org/v1/layer/4174747b-b2f4-4893-8948-6d7e3a9307cb/tile/gee/{z}/{x}/{y}',
          2003: 'https://api.resourcewatch.org/v1/layer/6f8cc468-962f-480d-998d-019110bb7504/tile/gee/{z}/{x}/{y}',
          2004: 'https://api.resourcewatch.org/v1/layer/630befa6-63f6-4cc2-8d43-9a657ad4506b/tile/gee/{z}/{x}/{y}',
          2005: 'https://api.resourcewatch.org/v1/layer/168f8e8e-d3c2-4176-b0ae-cc5dd956c80b/tile/gee/{z}/{x}/{y}',
          2006: 'https://api.resourcewatch.org/v1/layer/554fc3b3-7b42-42f2-beeb-053603e45a3f/tile/gee/{z}/{x}/{y}',
          2007: 'https://api.resourcewatch.org/v1/layer/79413e4c-8831-4b68-89c5-f4f9cd469434/tile/gee/{z}/{x}/{y}',
          2008: 'https://api.resourcewatch.org/v1/layer/6d072176-6860-4c80-826b-e8cfec601f3d/tile/gee/{z}/{x}/{y}',
          2009: 'https://api.resourcewatch.org/v1/layer/cb04e78f-518c-427d-bf80-45ef5d1d3ff3/tile/gee/{z}/{x}/{y}',
          2010: 'https://api.resourcewatch.org/v1/layer/b9c3d094-a299-4ae5-88fb-ef28a2bc7c39/tile/gee/{z}/{x}/{y}',
          2011: 'https://api.resourcewatch.org/v1/layer/5398bfb5-a889-4315-a656-e5438e24f36b/tile/gee/{z}/{x}/{y}',
          2012: 'https://api.resourcewatch.org/v1/layer/73bc9a66-faa9-4798-8daa-50c27fbfa469/tile/gee/{z}/{x}/{y}',
          2013: 'https://api.resourcewatch.org/v1/layer/1d68a6af-f319-4834-858a-feb455e55c24/tile/gee/{z}/{x}/{y}',
          2014: 'https://api.resourcewatch.org/v1/layer/687cf7d8-8729-4820-93af-12f3e2d2c112/tile/gee/{z}/{x}/{y}',
          2015: 'https://api.resourcewatch.org/v1/layer/7dcaace3-e257-451c-a9a2-0a5891b929a0/tile/gee/{z}/{x}/{y}',
          2016: 'https://api.resourcewatch.org/v1/layer/602fb567-9819-428f-8d22-2981454b7eae/tile/gee/{z}/{x}/{y}',
          2017: 'https://api.resourcewatch.org/v1/layer/4d545749-1dc1-4b58-b476-8b284867ee43/tile/gee/{z}/{x}/{y}',
          2018: 'https://api.resourcewatch.org/v1/layer/c7798680-6709-4965-9464-162987e58604/tile/gee/{z}/{x}/{y}',
          2019: 'https://api.resourcewatch.org/v1/layer/82bf293b-5988-41db-b7f5-f0c78ff08d4d/tile/gee/{z}/{x}/{y}',
          2020: 'https://api.resourcewatch.org/v1/layer/1a7e35db-29b2-420d-9b58-3aaa54317a82/tile/gee/{z}/{x}/{y}',
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
          name: 'Seasonal Water',
          color: '#69adc2',
        },
        {
          name: 'Permanent Water',
          color: '#204690',
        },
      ],
      timeline: {
        step: 1,
        interval: 'years',
        range: false,
        dateFormat: 'YYYY',
        minDate: '1984-01-01',
        maxDate: '2020-01-01',
      },
    },
  },
  'marine-protected-areas': {
    label: 'Marine protected areas',
    attributions: ['rw'],
    group: 'oceans',
    config: {
      type: 'vector',
      source: {
        minzoom: 2,
        maxzoom: 19,
        provider: {
          type: 'carto',
          account: 'rw-nrt',
          layers: [
            {
              options: {
                sql: 'SELECT * FROM bio_007b_rw0_marine_protected_area_polygon_edit',
              },
            },
          ],
        },
      },
      render: {
        layers: [
          {
            paint: {
              'line-color': '#0079B0',
              'line-opacity': 1,
              'line-width': 1,
            },
            'source-layer': 'layer0',
            type: 'line',
            filter: ['all'],
          },
          {
            id: 'marine-protected-areas-1',
            paint: {
              'fill-opacity': VECTOR_LAYERS_FILL_OPACITY,
              'fill-color': ' #0079B0',
            },
            'source-layer': 'layer0',
            type: 'fill',
            filter: ['all'],
          },
        ],
      },
      interactiveLayerIds: ['marine-protected-areas-1'],
      interactiveFeatureFormat: properties => ({
        'IUCN Category': properties.iucn_cat,
        Name: properties.name,
        Status: properties.status,
        'No-Take Status': properties.no_take,
        'Designation Type': properties.desig_type,
        'Ownership Type': properties.own_type,
        'Governance Type': properties.gov_type,
        'Management Authority': properties.mang_auth,
      }),
    },
    legend: {
      type: 'basic',
      items: [
        {
          name: 'Extent',
          color: '#0079B0',
        },
      ],
    },
  },
  'coral-reef-locations': {
    label: 'Coral reef locations',
    attributions: ['rw'],
    group: 'oceans',
    config: {
      type: 'vector',
      source: {
        minzoom: 2,
        maxzoom: 19,
        provider: {
          type: 'carto',
          account: 'wri-rw',
          layers: [
            {
              options: {
                sql:
                  'SELECT wri.name AS country, data.* FROM bio_004a_coral_reef_locations_edit data LEFT OUTER JOIN wri_countries_a wri ON data.parent_iso = wri.iso_a3',
              },
            },
          ],
        },
      },
      render: {
        layers: [
          {
            paint: {
              'line-width': 1,
              'line-color': '#FFCC00',
              'line-opacity': 1,
            },
            'source-layer': 'layer0',
            type: 'line',
            filter: ['all'],
          },
          {
            id: 'coral-reef-locations-1',
            paint: {
              'fill-color': '#FFCC00',
              'fill-opacity': VECTOR_LAYERS_FILL_OPACITY,
            },
            'source-layer': 'layer0',
            type: 'fill',
            filter: ['all'],
          },
        ],
      },
      interactiveLayerIds: ['coral-reef-locations-1'],
      interactiveFeatureFormat: properties => ({
        Name: properties.name,
        Species: properties.species,
        'Reported Area in sq. km': properties.rep_area_k,
        Country: properties.country,
      }),
    },
    legend: {
      type: 'basic',
      items: [
        {
          name: 'Coral reef areas',
          color: '#FFCC00',
        },
      ],
    },
  },
};

export const DATA_LAYERS_GROUPS = {
  forests: 'Forests',
  'food-agriculture': 'Food and agriculture',
  conservation: 'Conservation',
  people: 'People',
  industry: 'Industry',
  oceans: 'Oceans',
};

export const PRESETS = {
  'tree-cover-loss': {
    label: 'Tree cover loss',
    basemap: 'landsat',
    contextualLayers: [
      {
        id: 'labels-dark',
      },
      {
        id: 'admin-boundaries',
      },
      {
        id: 'hillshade',
      },
      {
        id: 'roads',
      },
      {
        id: 'water',
      },
    ],
    dataLayers: [
      {
        id: 'tree-cover-loss-cumulative',
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
    basemap: 'landsat',
    contextualLayers: [
      {
        id: 'labels-light',
      },
      {
        id: 'admin-boundaries',
      },
      {
        id: 'roads',
      },
      {
        id: 'water',
      },
    ],
    dataLayers: [
      {
        id: 'glad',
      },
      {
        id: 'land-cover',
      },
    ],
  },
  industry: {
    label: 'Industry',
    basemap: 'mongabay-paper',
    contextualLayers: [
      {
        id: 'labels-dark',
      },
      {
        id: 'admin-boundaries',
      },
      {
        id: 'hillshade',
      },
      {
        id: 'water',
      },
    ],
    dataLayers: [
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
    ],
  },
  infrastructure: {
    label: 'Infrastructure',
    basemap: 'mongabay-carbon',
    contextualLayers: [
      {
        id: 'labels-light',
      },
      {
        id: 'admin-boundaries',
      },
      {
        id: 'roads',
      },
    ],
    dataLayers: [
      {
        id: 'urban-built-up-area',
      },
      {
        id: 'population',
      },
      {
        id: 'tree-cover',
      },
    ],
  },
  'forest-alerts': {
    label: 'Forest tracker alerts',
    basemap: 'mongabay-paper',
    contextualLayers: [
      {
        id: 'labels-dark',
      },
      {
        id: 'admin-boundaries',
      },
      {
        id: 'hillshade',
      },
      {
        id: 'roads',
      },
    ],
    dataLayers: [
      {
        id: 'glad',
      },
      {
        id: 'primary-forests',
      },
      {
        id: 'tree-cover',
      },
    ],
  },
  conservation: {
    label: 'Conservation',
    basemap: 'mongabay-paper',
    contextualLayers: [
      {
        id: 'labels-dark',
      },
      {
        id: 'admin-boundaries',
      },
      {
        id: 'hillshade',
      },
      {
        id: 'water',
      },
    ],
    dataLayers: [
      {
        id: 'protected-areas',
      },
      {
        id: 'primary-forests',
      },
      {
        id: 'tree-cover',
      },
    ],
  },
};
