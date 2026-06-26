const { getDefaultConfig } = require('expo/metro-config');

/**
 * Metro configuration for Expo (standalone app, web supported).
 * https://docs.expo.dev/guides/customizing-metro/
 *
 * @type {import('expo/metro-config').MetroConfig}
 */
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push('wasm');

const zustandDir = path.dirname(require.resolve('zustand/package.json'));
const defaultResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    platform === 'web' &&
    (moduleName === 'zustand' || moduleName.startsWith('zustand/'))
  ) {
    const subpath = moduleName === 'zustand' ? 'index' : moduleName.slice('zustand/'.length);
    return {
      type: 'sourceFile',
      filePath: path.join(zustandDir, `${subpath}.js`),
    };
  }
  return defaultResolveRequest
    ? defaultResolveRequest(context, moduleName, platform)
    : context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
