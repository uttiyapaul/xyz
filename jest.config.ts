/**
 * jest.config.ts
 */

import '@testing-library/jest-dom'
import type { Config } from "jest";

const config: Config = {
  testEnvironment: "node",
  transform: {
    "^.+\\.tsx?$": ["ts-jest", {
      tsconfig: {
        strict:           true,
        esModuleInterop:  true,
        moduleResolution: "node",
        target:           "ES2022",
        lib:              ["ES2022", "dom"],
      },
    }],
  },
  moduleNameMapper: {
    // Handle Next.js env vars in tests
    "^@/(.*)$": "<rootDir>/$1",
  },
  testMatch: [
    "**/__tests__/**/*.test.ts",
    "**/__tests__/**/*.test.tsx",
  ],
  setupFiles: ["<rootDir>/jest.setup.ts"],
  collectCoverageFrom: [
    "store/**/*.ts",
    "services/**/*.ts",
    "core/**/*.ts",
    "types/**/*.ts",
    "!**/*.d.ts",
  ],
  coverageThresholds: {
    global: {
      branches:   80,
      functions:  85,
      lines:      85,
      statements: 85,
    },
  },
};

export default config;
