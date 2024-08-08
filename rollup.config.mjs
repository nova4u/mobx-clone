import pkg from "./package.json" assert { type: "json" };
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "rollup-plugin-typescript2";
import dts from "rollup-plugin-dts";

const createConfig = (input, output) => ({
  input,
  output: [
    {
      file: `dist/${output}.js`,
      format: "cjs",
      sourcemap: true,
    },
    {
      file: `dist/${output}.es.js`,
      format: "esm",
      sourcemap: true,
    },
  ],
  plugins: [
    resolve(),
    commonjs(),
    typescript({
      useTsconfigDeclarationDir: false,
      tsconfigOverride: {
        compilerOptions: {
          declaration: false,
        },
      },
    }),
  ],
  external: ["react", "react-dom"],
});

const createDtsConfig = (input, output) => ({
  input,
  output: [{ file: `dist/${output}.d.ts`, format: "es" }],
  plugins: [dts()],
});

export default [
  // Core library
  createConfig("src/index.ts", "index"),
  createDtsConfig("src/index.ts", "index"),

  // React-specific
  createConfig("src/react/index.ts", "react/index"),
  createDtsConfig("src/react/index.ts", "react/index"),
];
