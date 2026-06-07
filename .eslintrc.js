module.exports = {
  root: true,
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
