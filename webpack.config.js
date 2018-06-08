'use strict';

const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const path = require('path');
const NODE_ENV = process.env.NODE_ENV ? process.env.NODE_ENV.trim() : 'development'; // trim для удаления лишних пробелов, если платформа Windows

const jsLoaders = [ 'babel-loader' ];
const SERVER_PORT = process.env.PORT || 3012;

// if (NODE_ENV === 'development') jsLoaders.push('source-map-loader');

module.exports = {
    mode: NODE_ENV,
    devtool: 'cheap-module-source-map',
    entry: [
        'react-hot-loader/patch',
        `webpack-dev-server/client?http://0.0.0.0:${SERVER_PORT}`,
        'webpack/hot/only-dev-server',
        path.join(__dirname, 'example.js')
    ],
    output: {
        path: path.join(__dirname, '/build'),
        filename: 'js/[name].js',
        chunkFilename: 'js/[name].bundle.js'
    },
    devServer: {
        contentBase: './build'
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                loader: jsLoaders,
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.jsx']
    },
    optimization: {
        minimizer: [
            new UglifyJsPlugin({
                uglifyOptions: {
                    warning: false,
                    output: {
                        beautify: false,
                        comments: false
                    },
                    compress: {
                        sequences     : true,
                        booleans      : true,
                        loops         : true,
                        unused      : true,
                        warnings    : false,
                        drop_console: true,
                        unsafe      : true
                    }
                }
            })
        ],
        splitChunks: {
            name: true,
            automaticNameDelimiter: '-',
            cacheGroups: {
                vendors: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors'
                }
            }
        }
    }
}
