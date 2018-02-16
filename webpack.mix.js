let mix = require('laravel-mix');
const webpack = require('webpack');
const proc = process.env.PROC;
mix
    .setPublicPath('./')
    .webpackConfig({
        module: {
            rules: [
                {
                    test: /\.jsx?$/,
                    exclude: /node_modules/,
                    loader: 'babel-loader',
                    query: {
                        "presets": ["es2015", "stage-1", "react"],
                        "plugins": [[
                            "import",
                                {
                                    "libraryName": "antd",
                                    "style": true
                                }
                            ]]
                    }
                }
            ]
        },
        plugins: [
            new webpack.DefinePlugin({
                PROC: JSON.stringify(proc)
            })
        ]
    })
    .react('build.js', 'dist');