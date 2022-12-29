const path = require("path")

module.exports = {
    externalsPresets: {node: true},
    mode: "production",
    entry: {
        bot: "./src/bot.ts",
        downloadReplays: "./src/codingame/Replays.ts",
    },
    //devtool: "inline-source-map",
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
    },
    output: {
        publicPath: "",
        filename: "[name].js",
        path: path.resolve(__dirname, "dist"),
    },
}