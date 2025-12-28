import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import turboConfig from "eslint-config-turbo/flat";
import reactCompiler from "eslint-plugin-react-compiler";
import { defineConfig } from "eslint/config";
import baseConfigs from "./base.js";

export default defineConfig(
  baseConfigs,
  turboConfig,
  ...nextVitals,
  ...nextTs,
  reactCompiler.configs.recommended,
);
