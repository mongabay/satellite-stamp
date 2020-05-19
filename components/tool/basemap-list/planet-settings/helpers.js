import parse from 'date-fns/parse';
import format from 'date-fns/format';

/**
 * Return the list of options for the Planet basemap
 * @param {string} apiKey Planet API key
 * @returns {Promise<Object<string, { string: string[] }>>}
 */
export const getPlanetBasemapConfig = async apiKey => {
  try {
    const res = await fetch(
      `https://api.planet.com/basemaps/v1/mosaics?api_key=${apiKey}&_page_size=1000`
    );
    const { mosaics } = await res.json();

    return {
      Monthly: {
        ...mosaics
          .filter(mosaic => mosaic.interval === '1 mon')
          .map(mosaic => {
            const split = mosaic.name.split('_');
            const year = +split[2];
            const period = format(parse(`${split[3]}`, 'MM', new Date()), 'MMMM');
            return [year, period];
          })
          .reduce(
            (res, arr) => ({
              ...res,
              [arr[0]]: [...(res?.[arr[0]] ? res[arr[0]] : []), arr[1]],
            }),
            {}
          ),
      },
      Quarterly: {
        ...mosaics
          .filter(mosaic => mosaic.interval === '3 mons')
          .map(mosaic => {
            const split = mosaic.name.split('_');
            const year = +split[2].slice(0, 4);
            const period = split[2].slice(4, 6).toUpperCase();
            return [year, period];
          })
          .reduce(
            (res, arr) => ({
              ...res,
              [arr[0]]: [...(res?.[arr[0]] ? res[arr[0]] : []), arr[1]],
            }),
            {}
          ),
      },
    };
  } catch (e) {
    return null;
  }
};
