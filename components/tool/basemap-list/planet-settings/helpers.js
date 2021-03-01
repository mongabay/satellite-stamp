import moment from 'moment';

const MONTHLY_INTERVAL = '1 mon';
const QUARTERLY_INTERVAL = '3 mons';

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

    return mosaics
      .reverse() // Should order from most recent acquisition to oldest
      .map(({ name, interval, first_acquired, last_acquired }) => {
        // For some reason, Moment may say a month difference is 0
        const differenceInMonths = Math.max(
          1,
          moment(last_acquired).diff(moment(first_acquired), 'months')
        );

        // Planet historically had only monthly and quarterly basemaps, but depending on the user's
        // account, some of the basemaps marked as monthly have actually been captured in a period of
        // several months
        const isMonthly = interval === MONTHLY_INTERVAL && differenceInMonths === 1;
        const isSeveralMonths = interval === MONTHLY_INTERVAL && differenceInMonths > 1;
        const isQuarterly = interval === QUARTERLY_INTERVAL;

        if (isMonthly) {
          return ['Monthly', moment(first_acquired).format('MMM YYYY'), name];
        } else if (isSeveralMonths) {
          return [
            'Several months',
            `${moment(first_acquired).format('MMM YYYY')} - ${moment(last_acquired).format(
              'MMM YYYY'
            )}`,
            name,
          ];
        } else if (isQuarterly) {
          return [
            'Quarterly',
            `Q${moment(first_acquired).format('Q')} ${moment(first_acquired).format('YYYY')}`,
            name,
          ];
        } else {
          console.warn('Planet basemap: aquisition interval not supported.');
          return null;
        }
      })
      .filter(arr => arr !== null)
      .reduce(
        (res, item) => ({
          ...res,
          [item[0]]: [...(res[item[0]] || []), { label: item[1], value: item[2] }],
        }),
        {}
      );
  } catch (e) {
    return null;
  }
};
