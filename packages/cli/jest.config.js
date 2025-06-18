module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>"],
  testMatch: ["**/__tests__/**/*.test.ts", "**/?(*.)+(spec|test).ts"],
  testPathIgnorePatterns: ["/node_modules/", "/dist/", "/.*/dist/"],
  modulePathIgnorePatterns: ["<rootDir>/dist/"],
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  collectCoverageFrom: ["**/*.ts", "!**/*.d.ts", "!index.ts"],
  coverageDirectory: "coverage",
  clearMocks: true,
  verbose: true,
  passWithNoTests: true,
};
