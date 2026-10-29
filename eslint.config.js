const nextConfig = require('eslint-config-next');

module.exports = [
  ...Object.values(nextConfig),
  {
    files: ['app/**/*.{js,jsx}', 'components/**/*.{js,jsx}', 'hooks/**/*.{js,jsx}'],
  },
];