export default {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'src/**/*.js'
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 60,
      lines: 60,
      statements: 60
    }
  },
  testMatch: ['**/tests/**/*.test.js'],
  maxWorkers: '50%',
  verbose: true,
  testTimeout: 10000
};
