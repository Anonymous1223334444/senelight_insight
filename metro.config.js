const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Configuration pour Hermes
config.transformer = {
  ...config.transformer,
  experimentalImportSupport: false,
  inlineRequires: true,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
      nonInlinedRequires: ['React', 'react', 'react-native'],
    },
  }),
};

// Forcer la résolution des extensions appropriées pour Hermes
config.resolver = {
  ...config.resolver,
  sourceExts: ['js', 'jsx', 'ts', 'tsx', 'json'],
  resolverMainFields: ['react-native', 'browser', 'main'],
};

module.exports = config;