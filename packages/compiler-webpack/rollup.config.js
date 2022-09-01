import path from "path";

import copy from "rollup-plugin-copy";
import dts from "rollup-plugin-dts";
import esbuild from "rollup-plugin-esbuild";

const isBareModuleId = (id) =>
  !id.startsWith(".") && !path.isAbsolute(id);

/** @returns {import("rollup").RollupOptions[]} */
export default function rollup() {
  return [
    {
      external: (id) => isBareModuleId(id),
      input: "src/index.ts",
      plugins: [
        esbuild(),
        copy({
          targets: [
            { src: "package.json", dest: "dist" },
          ],
        }),
      ],
      output: {
        dir: "dist",
        format: "cjs",
      },
    },
    {
      input: `src/index.ts`,
      plugins: [dts()],
      output: {
        dir: "dist",
        format: "es",
      },
    },
    {
      external: (id) => isBareModuleId(id),
      input: "src/webpack-config/browser-routes-loader.ts",
      plugins: [esbuild()],
      output: {
        dir: "dist",
        format: "cjs",
        exports: "default",
      },
    },
    {
      input: "src/webpack-config/empty-module-loader.ts",
      plugins: [esbuild()],
      output: {
        dir: "dist",
        format: "cjs",
        exports: "default",
      },
    },
  ];
}
