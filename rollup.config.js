import babel from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import resolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import pkg from "./package.json" assert { type: "json" };

export default [
  {
    input: "src/index.js",
    external: ["@donkeyclip/motorcortex"],
    output: [
      { file: pkg.main, format: "cjs" },
      { file: pkg.module, format: "es" },
    ],
    plugins: [
      resolve(),
      babel({
        plugins: [
          "@babel/plugin-syntax-jsx",
          [
            "@babel/plugin-transform-react-jsx",
            {
              pragma: "JSX",
            },
          ],
        ],
        extensions: [".js", ".jsx"],
      }),
      commonjs(),
      json(),
    ],
  },
  {
    input: "src/index.js",
    external: ["@donkeyclip/motorcortex"],
    output: [
      {
        globals: {
          "@donkeyclip/motorcortex": "MotorCortex",
        },
        name: pkg.name,
        file: pkg.browser,
        format: "umd",
      },
    ],
    plugins: [
      json(),
      resolve({ mainFields: ["module", "main", "browser"] }),
      babel({
        plugins: [
          "@babel/plugin-syntax-jsx",
          [
            "@babel/plugin-transform-react-jsx",
            {
              pragma: "JSX",
            },
          ],
        ],
        extensions: [".js", ".jsx"],
      }),
      commonjs(),
      terser(),
    ],
  },
];
