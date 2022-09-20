module.exports = {
  testEnvironment: "node",
  testEnvironmentOptions: {
    NODE_ENV: "test",
  },
  restoreMocks: true,
  coveragePathIgnorePatterns: [
    "node_modules",
    "src/config",
    "src/app.js",
    "tests",
    "src/models/plugins/toJSON.plugin.js",
  ],
  coverageReporters: ["text", "lcov", "clover", "html"],
};
