import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "happy-dom",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "dist/",
        "playground/",
        "**/*.config.ts",
        "**/*.d.ts",
      ],
      // Note: Current coverage is ~11% overall due to client.ts complexity
      // Future improvements should aim to increase this threshold
      thresholds: {
        lines: 10,
        functions: 15,
        branches: 8,
        statements: 10,
      },
    },
  },
});
