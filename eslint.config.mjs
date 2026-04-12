// @ts-check
import { createConfigForNuxt } from "@nuxt/eslint-config/flat";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import unusedImports from "eslint-plugin-unused-imports";

export default createConfigForNuxt({
  features: {
    typescript: {
      strict: true,
    },
    stylistic: false, // Using Prettier for formatting
  },
})
  .append({
    ignores: [
      "**/node_modules/**",
      "**/.nuxt/**",
      "**/.output/**",
      "**/dist/**",
      "**/coverage/**",
      "**/test-results/**",
    ],
  })
  .append({
    rules: {
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-debugger": "warn",
    },
  })
  .append({
    plugins: {
      "simple-import-sort": simpleImportSort,
      "unused-imports": unusedImports,
    },
    rules: {
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      "unused-imports/no-unused-imports": "error",
    },
  })
  .append({
    files: ["scripts/**/*.mjs", "scripts/**/*.js"],
    rules: {
      "no-console": "off",
    },
  });
