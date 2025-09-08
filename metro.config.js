const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add CORS proxy for development
config.server = {
  ...config.server,
  rewriteRequestUrl: (url) => {
    if (url.startsWith('http://localhost:5000')) {
      // For development, we can use a CORS proxy
      return url;
    }
    return url;
  },
};

module.exports = config;
