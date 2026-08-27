import babelParser from "@babel/eslint-parser";
import js from "@eslint/js";
import prettierConfig from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier";
import react from "eslint-plugin-react";
import globals from "globals";

export default [
  { ignores: ["dist/", "demo/bundle.js", "bundle.js"] },
  js.configs.recommended,
  react.configs.flat.recommended,
  prettierConfig,
  {
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        babelOptions: {
          presets: ["@babel/preset-react"],
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        describe: true,
        before: true,
        it: true,
        expect: true,
        sinon: true,
      },
    },
    plugins: {
      prettier: prettierPlugin,
    },
    settings: {
      react: { version: "18" },
    },
    rules: {
      "prettier/prettier": ["error"],
      "linebreak-style": ["error", "unix"],
      semi: ["error", "always"],
      "no-console": ["error", { allow: ["warn", "error", "info"] }],
      "prefer-promise-reject-errors": "error",
      "prefer-const": [
        "error",
        { destructuring: "any", ignoreReadBeforeAssign: false },
      ],
      "no-var": "error",
      "no-unused-vars": "error",
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",
    },
  },
];
