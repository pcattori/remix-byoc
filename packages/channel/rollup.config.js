import copy from "rollup-plugin-copy";
import dts from "rollup-plugin-dts";
import esbuild from "rollup-plugin-esbuild";

/** @returns {import("rollup").RollupOptions[]} */
export default function rollup() {
  return [
    {
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
  ];
}
