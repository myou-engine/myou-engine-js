'use strict'

var webpack = require('webpack');

module.exports = {
    context: __dirname,
    entry: [
        __dirname + '/main.coffee',
    ],
    stats: {
        colors: true,
        reasons: true
    },
    module: {
        loaders: [
            {
                test: /\.coffee$/,
                loaders: [
                    'coffee-loader',
                    'source-map-loader',
                ]
            },
            {
                test: /\.(png|jpe?g|gif)$/i,
                loader: "url-loader?limit=18000&name=[path][name].[ext]",
            },
            {test: /\.svg$/, loader: 'url-loader?mimetype=image/svg+xml'},
            {test: /\.woff2?$/, loader: 'url-loader?mimetype=application/font-woff'},
            {test: /\.eot$/, loader: 'url-loader?mimetype=application/font-woff'},
            {test: /\.ttf$/, loader: 'url-loader?mimetype=application/font-woff'},
            {test: /\.json$/, loader: 'json-loader'}
        ]
    },
    output: {
        path: __dirname + '/build/',
        filename: "myou.js",
        library: "myou"
    },
    devtool: 'inline-source-map',
    plugins: [
    ],
    resolve: {
        extensions: ["", ".webpack.js", ".web.js", ".js", ".coffee", ".json"]
    },
}
