import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  testMatch: ["**/test/**/*.test.ts"],
  moduleFileExtensions: ["ts", "js"],
};

export default config;
