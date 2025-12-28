import expoConfig from "eslint-config-expo/flat/utils/expo.js";
import turboConfig from "eslint-config-turbo/flat";
import { defineConfig } from "eslint/config";
import baseConfigs from "./base.js";
import reactInternal from "./react-internal.js";

export default defineConfig(
  baseConfigs,
  turboConfig,
  expoConfig,
  reactInternal,
  {
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
);
