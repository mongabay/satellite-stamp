export const COLORS = ['#03755E', '#184B95', '#A01200', '#7E56D8'];

export const TOOLS = [
  {
    id: 'satellite',
    title: 'Earth Atlas',
    description:
      'Create images of maps using a wide set of basemaps, contextual layers and data layers or explore the map presets that provide information about topics like conservation.',
    color: COLORS[1],
    image: '/images/satellite-tool.png',
    name: 'Earth Atlas',
    url: 'https://maps.mongabay.com',
  },
  {
    id: 'fire',
    title: 'Fire Weather Almanac',
    description:
      'Explore and report temporal interactions between annual precipitation and fire occurrences at national and subnational scales.',
    color: COLORS[2],
    image: '/images/fire-tool.png',
    name: 'Fire Weather Almanac',
    url: 'https://charts.mongabay.com',
  },
  {
    id: 'reforestation',
    title: 'Reforestation App',
    description:
      'Mongabay’s global directory of reforestation and tree-planting projects is a starting point for people wanting to support reforestation.',
    color: COLORS[0],
    image: '/images/reforestation-tool.png',
    name: 'Reforestation App',
    url: 'https://reforestation.app',
  },
  {
    id: 'supply',
    title: 'Trade Flow Map',
    description:
      'Create images of maps with flows representing the exchange of a variety of commodities across the world.',
    color: COLORS[3],
    image: '/images/supply-tool.png',
    name: 'Trade Flow Map',
    url: 'https://chains.mongabay.com',
  },
];
