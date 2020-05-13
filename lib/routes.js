const createRoutes = require('next-routes');
const escapeRegExp = require('lodash/escapeRegExp');

// @ts-ignore Types are broken
const routes = createRoutes();

// We override findAndGetUrls to support the Next.js's setting assetPrefix
// See: https://github.com/fridays/next-routes/issues/30
const oldFindAndGetUrls = routes.findAndGetUrls.bind(routes);

routes.findAndGetUrls = (nameOrUrl, params) => {
  const basePath = process.env.BASE_PATH;

  let mNameOrUrl = nameOrUrl;
  if (basePath && basePath !== '/') {
    const re = new RegExp(`^${escapeRegExp(basePath)}`);
    mNameOrUrl = nameOrUrl.replace(re, '');
  }

  const findAndGetUrls = oldFindAndGetUrls(mNameOrUrl, params);

  if (basePath && basePath !== '/') {
    findAndGetUrls.urls.as = `${basePath}${findAndGetUrls.urls.as}`;
  }

  return findAndGetUrls;
};

routes.add('home', '/', 'index');
routes.add('explore', '/explore', 'explore');

// Fix some TSLint issues
const exportedModule = routes;
exportedModule.Link = routes.Link;
exportedModule.Router = routes.Router;

module.exports = exportedModule;
