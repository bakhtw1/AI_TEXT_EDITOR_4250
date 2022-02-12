import * as path from "path";
import { Configuration } from "webpack";
import MonacoEditorWebpackPlugin from "monaco-editor-webpack-plugin"; 
import CopyWebpackPlugin from "copy-webpack-plugin";

const rootPath = path.resolve(__dirname, "..");

const config: Configuration = {
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  devtool: "source-map",
  entry: path.resolve(rootPath, "src/main", "main.ts"),
  target: "electron-main",
  module: {
    rules: [
      {
        test: /\.(js|ts|tsx)$/,
        exclude: /node_modules/,
        include: /src/,
        use: {
          loader: "ts-loader",
        },
      },
    ],
  },
  node: {
    __dirname: false,
  },
  output: {
    path: path.resolve(rootPath, "dist"),
    filename: "[name].js",
  },
  plugins: [

  ]
};

export default config;
