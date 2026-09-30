/**
 * Compile-time fork customization.
 *
 * Everything in this folder is fork-specific and lives outside `src/`, so that upstream sources
 * stay byte-identical and a sync with Violentmonkey never conflicts here.
 * All the credit for the extension itself goes to the Violentmonkey authors.
 */
const fs = require('fs');
const path = require('path');
const through = require('through2').default;
const brand = require('./brand.config');
const gmApi = require('./gm-api.config');

const resolveHere = file => path.resolve(__dirname, file);

/** Full display name, e.g. `UserScripts BETA`. */
const getName = (isBeta) => brand.name + (isBeta ? brand.betaSuffix : '');

/** Absolute path of the source image used to generate the extension icons. */
const getIconPath = (isBeta) => {
  const file = resolveHere(isBeta ? brand.iconBeta : brand.icon);
  if (!fs.existsSync(file)) throw new Error(`Branding icon is missing: ${file}`);
  return file;
};

/** Values exposed to the bundles via webpack's DefinePlugin as `__.XXX`. */
const getDefines = () => ({
  BRAND: brand.name,
  MANUAL_SITE_ACCESS: !!brand.manualSiteAccess,
});

const replaceWords = (text) => brand.localeReplacements.reduce(
  (res, [from, to]) => res.split(from).join(to),
  text);

/** Rebrands the messages of every language, at build time, without touching `_locales` sources. */
const rebrandLocales = () => through.obj(function _(file, enc, cb) {
  if (file.isBuffer()) {
    const data = JSON.parse(file.contents.toString('utf8'));
    for (const item of Object.values(data)) {
      if (typeof item?.message === 'string') item.message = replaceWords(item.message);
    }
    file.contents = Buffer.from(JSON.stringify(data, null, 2), 'utf8');
  }
  cb(null, file);
});

/** Applies the fork's branding to the generated manifest. */
const rebrandManifest = (data, isBeta) => {
  data.homepage_url = brand.homepageUrl;
  if (isBeta) {
    // Upstream doesn't localize beta builds, so the name is set here too
    const name = getName(true);
    data.name = name;
    const action = data.action || data.browser_action;
    if (action) action.default_title = name;
  }
  return data;
};

module.exports = {
  brand,
  gmApi,
  getName,
  getIconPath,
  getDefines,
  rebrandLocales,
  rebrandManifest,
  replaceWords,
};
