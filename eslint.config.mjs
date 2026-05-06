// @ts-check
import { createConfigForNuxt } from "@nuxt/eslint-config/flat";

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
      "vue/html-self-closing": [
        "warn",
        {
          html: {
            void: "any",
            normal: "always",
            component: "always",
          },
          svg: "always",
          math: "always",
        },
      ],
    },
  })
  .append({
    files: ["scripts/**/*.mjs", "scripts/**/*.js"],
    rules: {
      "no-console": "off",
    },
  });
