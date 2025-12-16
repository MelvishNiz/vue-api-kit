import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import pkg from "./package.json";

export default defineConfig({
  build: {
    lib: {
      entry: "./src/index.ts",
      name: pkg.name,
      fileName: "index",
      formats: ["es"],
    },
    rollupOptions: {
      external: [
        "vue",
        "axios",
        "lodash-es",
        "zod",
        /^zod\//,
      ],
    },
    sourcemap: false,
    emptyOutDir: true,
    minify: "esbuild",
    target: "esnext",
  },
  plugins: [
    dts({
      entryRoot: "src",
      outDir: "dist",
      tsconfigPath: "./tsconfig.json",
      insertTypesEntry: true,
    }),
  ],
});