module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/__tests__/**/*.test.js'],
    // The initiative module keeps state in module-level variables and several
    // DB-backed suites share a single in-memory Mongo; run serially.
    maxWorkers: 1,
}
