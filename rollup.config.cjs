const path = require("path");
const typescript = require("@rollup/plugin-typescript");
const dts = require("rollup-plugin-dts").default;

module.exports = [
  {
    input: path.resolve(__dirname, "src/index.ts"),
    output: [
      {
        file: "dist/index.cjs.js",
        format: "cjs",
      },
      {
        file: "dist/index.esm.js",
        format: "es",
      },
    ],
    plugins: [typescript()],
  },
  {
    input: path.resolve(__dirname, "src/index.ts"),
    output: [{ file: "dist/index.d.ts", format: "es" }],
    plugins: [dts()],
  },
];
