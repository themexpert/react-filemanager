let mix = require('laravel-mix');

mix
    .setPublicPath('dist')
    .webpackConfig({
        module: {
            rules: [
                {
                    test: /\.jsx?$/,
                    exclude: /node_modules/,
                    loader: 'babel-loader',
                    query: {
                        "presets": ["react", "env", "stage-0"],
                        "plugins": ["transform-decorators-legacy"]
                    }
                }
            ]
        }
    })
    .react('build.js', 'dist');