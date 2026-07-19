module.exports = {
  root: true,
  ignorePatterns: ['dist/**', 'node_modules/**', 'server/__pycache__/**', 'server/build/**', 'assets/**'],
  extends: '@react-native',
  rules: {
    // Keep dependency hints visible without failing lint; the rules-of-hooks
    // rule (which catches real bugs) stays at "error".
    'react-hooks/exhaustive-deps': 'warn',
  },
  overrides: [
    {
      files: ['jest.setup.js'],
      env: { jest: true },
    },
  ],
};
