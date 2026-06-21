const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

const ignoredPaths = [
  /node_modules\/(?:jsdom|jest|jest-.+|@jest\/.+|@testing-library\/.+)\/.*/,
  /node_modules\/.*\/__tests__\/.*/,
  /node_modules\/.*\/__mocks__\/.*/,
  /node_modules\/.*\/test\/.*/,
  /node_modules\/.*\/tests\/.*/,
  /node_modules\/.*\/coverage\/.*/,
  /node_modules\/.*\/\.cache\/.*/,
];

config.resolver.blockList = [...(config.resolver.blockList || []), ...ignoredPaths];

module.exports = config;
