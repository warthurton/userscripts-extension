# UserScriptsExt

UserScriptsExt provides userscripts support for browsers.
It works on browsers with [WebExtensions](https://developer.mozilla.org/en-US/Add-ons/WebExtensions) support.

## Automated Builds for Testers

A test build is generated automatically for changes between beta releases. It can be installed as an unpacked extension in Chrome and Chromium-based browsers or as a temporary extension in Firefox. It's likely to have bugs so do an export in UserScriptsExt settings first. This zip is available only if you're logged-in on GitHub site. Open an entry in the [CI workflows](https://github.com/warthurton/userscripts-extension/actions/workflows/ci.yml) table and click the `UserScriptsExt-...` link at the bottom to download it.

## Workflows

### Development

Install [Node.js](https://nodejs.org/) and Yarn v1.x.
The version of Node.js should match `"node"` key in `package.json`.

``` sh
# Install dependencies
$ yarn

# Watch and compile
$ yarn dev
```

Then load the extension from 'dist/'.

### Build

To release a new version, we must build the assets and upload them to web stores.

``` sh
# Build for normal releases
$ yarn build

# Build for self-hosted release that has an update_url
$ yarn build:selfHosted
```

### Release

See [RELEASE](RELEASE.md) for the release flow.
