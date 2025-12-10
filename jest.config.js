module.exports = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testMatch: [
    "**/__tests__/**/*.test.{ts,tsx}",
    "**/?(*.)+(spec|test).{ts,tsx}",
  ],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/example/**",
    "!src/cli/**",
    "!src/data/**",
  ],
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 70,
      functions: 70,
      lines: 70,
    },
  },
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
  },
  transformIgnorePatterns: [
    "node_modules/(?!(react-native|@react-native|@react-navigation)/)",
  ],
  moduleNameMapper: {
    "\\.(jpg|jpeg|png|gif|svg)$": "<rootDir>/__mocks__/fileMock.js",
    "^react-native$": "<rootDir>/__mocks__/react-native.js",
  },
  testEnvironment: "node",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
};
