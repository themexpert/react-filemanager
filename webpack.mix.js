let mix = require('laravel-mix');

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
        }
    })
    .react('build.js', 'dist');