# fork-brand

Everything that makes this fork different from [Violentmonkey](https://github.com/violentmonkey/violentmonkey)
lives here, outside `src/`, and is applied **at compile time**.

The upstream sources are left as they are (apart from a handful of one-line hooks), so:

- `git merge upstream/master` never conflicts inside this folder;
- nothing needs to be re-applied by hand after a sync;
- all credit for the extension stays with the Violentmonkey authors — this folder only changes the
  label, and switches a few things off.

## Files

| File | Purpose |
| --- | --- |
| `brand.config.js` | Displayed name, homepage, locale word replacements, icon, site-access mode |
| `gm-api.config.js` | Which `GM_*` APIs are compiled into the build |
| `babel-plugin-block-gm-api.js` | Removes the disabled `GM_*` implementations during compilation |
| `icons/` | Source icons, rendered into every size the manifest needs |
| `index.js` | Glue used by `gulpfile.js`, `babel.config.js` and `scripts/webpack*.js` |

## Renaming

`brand.config.js` drives:

- `_locales/**` — every `message` of every language is rewritten while the build copies it to `dist`;
- the manifest `name` (via the locale above), `homepage_url` and the beta title;
- the HTML `<title>` of the dashboard/popup/confirm pages;
- the `BRAND` global used by user-visible messages and the `[BRAND]` console prefix;
- the extension icons.

The internal `VIOLENTMONKEY` constant is intentionally **not** renamed: it is used for the
IndexedDB name, storage keys, sync folder names and `GM_info.scriptHandler`, so changing it would
break existing profiles, sync targets and userscripts that check the script handler.

## Disabling `GM_*` APIs

`gm-api.config.js` lists every `GM_*` API of `src/injected/web/gm-api.js`, each explicitly set to
`true` or `false`:

- `true` — the upstream implementation is compiled in, unchanged.
- `false` — during compilation, `babel-plugin-block-gm-api.js` **replaces the implementation** with
  a stub. The original code is not in the build at all; there is no runtime flag, no feature check
  and no way to reach the original code path. Calling the API logs
  `[<brand>] GM_xxx is not available in this build.` to the page console and throws the same message
  back into the userscript, so the script author sees a real error instead of silent nothing.

An API found in the sources but missing from `gm-api.config.js` **fails the build**. This is
deliberate: after syncing with upstream, a newly added API can never become available by accident —
someone has to make a decision and write it down.

`GM_cookie` is special-cased: the body of its `gmCookieInvoker` helper is replaced instead of the
table entry, so `GM_cookie.list/set/delete` keep existing and report the block properly.

## Site access

With `manualSiteAccess: true` the default blocklist gets a catch-all rule, so userscripts run
nowhere until the user opens the popup on a site and clicks *Allow userscripts on this site*, which
prepends `@match *://<host>/*` to the blocklist (upstream's blocklist already supports such
allow-rules, so no injection logic is forked). Set it to `false` for an upstream-like build.
