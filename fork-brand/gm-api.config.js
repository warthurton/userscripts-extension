/**
 * Compile-time availability of the `GM_*` / `GM.*` namespace.
 *
 * `true`  - the upstream implementation is compiled in, as-is.
 * `false` - the implementation is REMOVED from the bundle at compile time by
 *           `fork-brand/babel-plugin-block-gm-api.js`. What is left is a stub that logs an error
 *           to the console and throws it back into the calling userscript. There is no runtime
 *           flag to flip: the original code is simply not part of the build.
 *
 * Every `GM_*` member of the API tables in `src/injected/web/gm-api.js` must be listed here
 * explicitly (`true` or `false`). A missing entry fails the build, so a new upstream API can
 * never become available by accident after a sync with upstream.
 */
module.exports = {
  GM_addElement: true,
  GM_addStyle: true,
  GM_addValueChangeListener: true,
  GM_cookie: true,
  GM_deleteValue: true,
  GM_deleteValues: true,
  GM_download: true,
  GM_getResourceText: true,
  GM_getResourceURL: true,
  GM_getValue: true,
  GM_getValues: true,
  GM_listValues: true,
  GM_log: true,
  GM_notification: true,
  GM_openInTab: true,
  GM_registerMenuCommand: true,
  GM_removeValueChangeListener: true,
  GM_setClipboard: true,
  GM_setValue: true,
  GM_setValues: true,
  GM_unregisterMenuCommand: true,
  GM_xmlhttpRequest: true,
};
