const { getDefaultConfig } = require('expo/metro-config');

/**
 * Metro configuration for Expo (standalone app, web supported).
 * https://docs.expo.dev/guides/customizing-metro/
 *
 * @type {import('expo/metro-config').MetroConfig}
 */
const config = getDefaultConfig(__dirname);

module.exports = config;
