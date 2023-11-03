import commonjs from "@rollup/plugin-commonjs";
import dsv from "@rollup/plugin-dsv";
import json from "@rollup/plugin-json";
import terser from "@rollup/plugin-terser";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import postcss from "rollup-plugin-postcss";

// import pkg from "./package.json" assert { type: "json" };

export default {
  input: "src/experiment/index.js",
  plugins: [
    postcss({
      inject: true, // This will inject the CSS to the HTML document
    }),
    dsv(),
    json(),
    nodeResolve({
      preferBuiltins: true,
    }),
    terser(),
    commonjs(),
  ],
  output: [
    {
      dir: "lib",
      name: "@bdelab/roar-survey",
      entryFileNames: "[name].[hash].js",
      chunkFileNames: "[name].[hash].js",
      format: "es",
    },
  ],
};
