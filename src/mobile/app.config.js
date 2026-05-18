const fs = require('fs');
const path = require('path');

function loadDotenv(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8')
      .split(/\r?\n/)
      .filter((line) => line.trim() && !line.trim().startsWith('#'))
      .reduce((env, line) => {
        const [key, ...valueParts] = line.split('=');
        env[key.trim()] = valueParts.join('=').trim();
        return env;
      }, {});
  } catch {
    return {};
  }
}

const env = loadDotenv(path.resolve(__dirname, '.env'));
const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || env.EXPO_PUBLIC_API_BASE_URL || undefined;
const appJson = require('./app.json');

module.exports = {
  ...appJson,
  expo: {
    ...appJson.expo,
    extra: {
      ...appJson.expo.extra,
      ...(apiBaseUrl ? { apiBaseUrl } : {}),
    },
  },
};
