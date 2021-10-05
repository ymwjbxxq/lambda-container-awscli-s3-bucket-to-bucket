const path = require('path');
const webpack = require('webpack');
const { ESBuildPlugin } = require('esbuild-loader');

module.exports = {
  entry: "./src/handler.ts",
  mode: "production",
  target: "node",
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js", ".json"],
  },
  externals: [],
  plugins: [new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/), new ESBuildPlugin()],
  output: {
    filename: "bucket-to-bucket.js",
    path: path.resolve(__dirname, "./"),
    libraryTarget: "commonjs2",
  },
};
