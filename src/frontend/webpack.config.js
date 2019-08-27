const path = require('path');
const runtime = require("regenerator-runtime/runtime");

module.exports = {
    mode: 'development',
    devtool: 'source-map',
    entry: './src/index.jsx',
    output: {
        filename: 'main.js',
        path: '/output',
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: ['babel-loader']
            }
        ]
    },
    resolve: {
        extensions: ['*', '.js', '.jsx']
    }
};
