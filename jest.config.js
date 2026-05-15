module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js'
  ],
  testTimeout: 30000,
  verbose: true,
  forceExit: true,
  clearMocks: true,
  detectOpenHandles: false,
  maxWorkers: 1
};