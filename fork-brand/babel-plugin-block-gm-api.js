const path = require('path');
const gmApiConfig = require('./gm-api.config');
const brand = require('./brand.config');

/** Tables in `src/injected/web/gm-api.js` that hold the GM_* implementations. */
const API_TABLES = ['GM_API', 'GM_API_CTX', 'GM_API_CTX_GM4ASYNC'];
/** `GM_cookie` is exposed via this helper, so its body is replaced instead of the table entry. */
const COOKIE_INVOKER = 'gmCookieInvoker';
const COOKIE_API = 'GM_cookie';
const TARGET_FILE = path.join('src', 'injected', 'web', 'gm-api.js');

const isTargetFile = filename => !!filename
  && path.normalize(filename).endsWith(TARGET_FILE);

const getKeyName = node => (
  node.computed ? null
    : node.key?.type === 'Identifier' ? node.key.name
      : node.key?.type === 'StringLiteral' ? node.key.value
        : null
);

const isDisabled = name => gmApiConfig[name] === false;

/**
 * Builds the replacement for a disabled API: a function that reports the block
 * both in the console and to the calling userscript.
 */
const buildStub = (t, name) => {
  const text = `[${brand.name}] ${name} is not available in this build.`;
  const message = () => t.stringLiteral(text);
  return t.functionExpression(null, [], t.blockStatement([
    t.expressionStatement(t.callExpression(
      t.memberExpression(t.identifier('logging'), t.identifier('error')),
      [message()])),
    t.throwStatement(t.newExpression(t.identifier('SafeError'), [message()])),
  ]));
};

module.exports = function blockGmApi({ types: t }) {
  return {
    name: 'fork-brand-block-gm-api',
    visitor: {
      ObjectExpression(nodePath, state) {
        if (!isTargetFile(state.filename)) return;
        const parent = nodePath.parent;
        if (parent.type !== 'VariableDeclarator'
          || parent.id.type !== 'Identifier'
          || !API_TABLES.includes(parent.id.name)) return;
        for (const prop of nodePath.get('properties')) {
          const name = getKeyName(prop.node);
          if (!name || !name.startsWith('GM_')) continue;
          if (!(name in gmApiConfig)) {
            throw prop.buildCodeFrameError(
              `${name} is missing in fork-brand/gm-api.config.js.`
              + ' Add it with an explicit `true` or `false`.');
          }
          if (!isDisabled(name)) continue;
          // `GM_cookie` is handled via its invoker to keep .delete/.list/.set working
          if (name === COOKIE_API) continue;
          const stub = buildStub(t, name);
          if (prop.node.type === 'ObjectMethod') {
            prop.replaceWith(t.objectProperty(prop.node.key, stub));
          } else if (prop.node.value.type === 'AssignmentExpression') {
            // e.g. `GM_xmlhttpRequest: GM4_ALIAS.xmlHttpRequest = function () {...}`
            prop.get('value.right').replaceWith(stub);
          } else {
            prop.get('value').replaceWith(stub);
          }
        }
      },
      FunctionDeclaration(nodePath, state) {
        if (!isTargetFile(state.filename)) return;
        if (nodePath.node.id?.name !== COOKIE_INVOKER || !isDisabled(COOKIE_API)) return;
        nodePath.get('body').replaceWith(buildStub(t, COOKIE_API).body);
      },
    },
  };
};

module.exports.API_TABLES = API_TABLES;
