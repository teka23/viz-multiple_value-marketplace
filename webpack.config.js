var path = require("path");

const UglifyJSPlugin = require("uglifyjs-webpack-plugin");

var webpackConfig = {
  mode: 'production',
  entry: {
    multiple_value: "./src/multiple_value/multiple_value_container.js",
  },
  devServer: {
    contentBase: './dist',
  },
  output: {
    filename: "[name].js",
    path: __dirname,
    library: "[name]",
    libraryTarget: "umd"
  },
  resolve: {
    extensions: [".js"],
    modules: [path.join(__dirname, "../src"), "node_modules"]
  },
  plugins: [new UglifyJSPlugin()],
  module: {
    rules: [
      { test: /\.(js|jsx)$/, use: "babel-loader"}
    ]
  },
  stats: {}
};

module.exports = webpackConfig;
