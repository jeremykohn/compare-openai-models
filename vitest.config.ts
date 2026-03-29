import { defineConfig, mergeConfig } from "vitest/config";
import { sharedConfig } from "./vitest.shared.config";

export default defineConfig(
  mergeConfig(sharedConfig, {
    test: {
      environment: "node",
      fileParallelism: false,
      maxWorkers: 1,
      minWorkers: 1,
    },
  }),
);
