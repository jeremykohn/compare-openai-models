import { fileURLToPath } from "node:url";

export const sharedConfig = {
  resolve: {
    alias: {
      "~~": fileURLToPath(new URL(".", import.meta.url)),
      "~": fileURLToPath(new URL("./app", import.meta.url)),
      "#imports": fileURLToPath(new URL("./app/auto-imports", import.meta.url)),
    },
  },
  test: {
    globals: true,
    setupFiles: ["tests/test-setup.ts"],
  },
};
