const path = require('path');
const fs = require('fs');
const babel = require('@babel/core');

const PLUGIN = path.resolve(__dirname, '../../fork-brand/babel-plugin-block-gm-api.js');
const CONFIG = path.resolve(__dirname, '../../fork-brand/gm-api.config.js');
const FILENAME = path.resolve(__dirname, '../../src/injected/web/gm-api.js');

const SRC = `
export const GM4_ALIAS = createNullObj();
export const GM_API_CTX_GM4ASYNC = {
  __proto__: null,
  GM_cookie: gmCookieInvoker,
  GM_setValue(key, val) { return dumpValue(this, true, { [key]: val }); },
};
export const GM_API_CTX = {
  __proto__: null,
  GM_xmlhttpRequest: GM4_ALIAS.xmlHttpRequest = function (opts) {
    return onRequestCreate(nullObjFrom(opts), this);
  },
};
export const GM_API = {
  __proto__: null,
  GM_log: logging.log,
};
export function gmCookieInvoker(cmd) { return bridge.post(cmd); }
`;

const transform = (config, code = SRC) => {
  jest.resetModules();
  jest.doMock(CONFIG, () => config);
  const plugin = require(PLUGIN); // eslint-disable-line global-require
  return babel.transformSync(code, {
    filename: FILENAME,
    configFile: false,
    babelrc: false,
    plugins: [plugin],
  }).code;
};

const ALL_ENABLED = {
  GM_cookie: true,
  GM_log: true,
  GM_setValue: true,
  GM_xmlhttpRequest: true,
};

afterEach(() => jest.dontMock(CONFIG));

test('keeps enabled APIs untouched', () => {
  const out = transform(ALL_ENABLED);
  expect(out).toContain('dumpValue(this, true');
  expect(out).toContain('onRequestCreate(nullObjFrom(opts), this)');
  expect(out).toContain('GM_log: logging.log');
  expect(out).not.toContain('not available in this build');
});

test('removes the implementation of a disabled method and throws instead', () => {
  const out = transform({ ...ALL_ENABLED, GM_setValue: false });
  expect(out).not.toContain('dumpValue(this, true');
  expect(out).toContain('GM_setValue is not available in this build.');
  expect(out).toContain('throw new SafeError(');
  expect(out).toContain('onRequestCreate(nullObjFrom(opts), this)');
});

test('keeps the GM4 alias assignment of a disabled API', () => {
  const out = transform({ ...ALL_ENABLED, GM_xmlhttpRequest: false });
  expect(out).toContain('GM4_ALIAS.xmlHttpRequest =');
  expect(out).not.toContain('onRequestCreate');
  expect(out).toContain('GM_xmlhttpRequest is not available in this build.');
});

test('replaces a disabled API defined as a reference', () => {
  const out = transform({ ...ALL_ENABLED, GM_log: false });
  expect(out).not.toContain('logging.log');
  expect(out).toContain('GM_log is not available in this build.');
});

test('blocks GM_cookie via its invoker so the sub-methods report it too', () => {
  const out = transform({ ...ALL_ENABLED, GM_cookie: false });
  expect(out).toContain('GM_cookie: gmCookieInvoker');
  expect(out).not.toContain('bridge.post(cmd)');
  expect(out).toContain('GM_cookie is not available in this build.');
});

test('fails the build when an API is missing in the config', () => {
  const incomplete = { ...ALL_ENABLED };
  delete incomplete.GM_setValue;
  expect(() => transform(incomplete)).toThrow(/GM_setValue is missing/);
});

test('the shipped config covers every API of the real gm-api.js', () => {
  jest.resetModules();
  expect(() => babel.transformSync(fs.readFileSync(FILENAME, 'utf8'), {
    filename: FILENAME,
    configFile: false,
    babelrc: false,
    plugins: [PLUGIN, '@babel/plugin-syntax-function-bind'],
  })).not.toThrow();
});
