import path from "path";
import webpack from "webpack";

const config : webpack.Configuration = {
    entry: "./src/index.ts",
    devtool: "eval-source-map",
    mode: "development",
    output: {
        filename: "main.js",
        path: path.resolve(__dirname, "public")
    },
    module: {
        rules: [
            {
                test:  /\.([cm]?ts)$/,
                use: "ts-loader"
            }
        ]
    },
    resolve: {
        extensions: [".ts", ".js"]
    }
}  

export default config;
