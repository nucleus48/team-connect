import turboConfig from "eslint-config-turbo/flat";
import { defineConfig } from "eslint/config";
import globals from "globals";
import baseConfigs from "./base.js";

export default defineConfig(baseConfigs, turboConfig, {
  languageOptions: {
    globals: {
      ...globals.node,
      ...globals.jest,
    },
    sourceType: "commonjs",
    parserOptions: {
      projectService: true,
      tsconfigRootDir: process.cwd(),
    },
  },
});
