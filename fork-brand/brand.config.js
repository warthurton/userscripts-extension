/**
 * Fork-specific branding, applied at COMPILE TIME only.
 * Nothing here is a fork of Violentmonkey's own logic: the upstream sources stay untouched,
 * this file only describes what the build should display.
 */
module.exports = {
  /** Displayed as the extension name, in page titles, in the popup header and in console logs. */
  name: 'UserScripts',
  /** Appended to `name` for beta builds. */
  betaSuffix: ' BETA',
  /** `homepage_url` of the generated manifest. */
  homepageUrl: 'https://github.com/warthurton/userscripts-extension',
  /**
   * Words replaced in the generated `_locales/*` of every language.
   * Applied in order, case-sensitively, to `message` fields only.
   */
  localeReplacements: [
    ['Violentmonkey', 'UserScripts'],
    ['ViolentMonkey', 'UserScripts'],
    ['violentmonkey', 'userscripts'],
  ],
  /**
   * Icon rendered into all the sizes the manifest needs.
   * Relative to this folder. SVG or PNG, both are read by `sharp`.
   */
  icon: 'icons/icon.svg',
  iconBeta: 'icons/icon-beta.svg',
  /**
   * When true, userscripts run only on sites the user allowed explicitly
   * (via the "allow this site" button in the extension popup).
   * Implemented by seeding the built-in blocklist with a catch-all rule, so no upstream
   * injection logic is forked; the popup just prepends `@match` rules for allowed sites.
   */
  manualSiteAccess: true,
};
