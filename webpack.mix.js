let mix = require('laravel-mix');
const webpack = require('webpack');
mix
  .setPublicPath('./')
  .webpackConfig({
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          //exclude: /node_modules/,
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
  .react('build.js', 'dist')
  .less('src/style.less', 'dist')
  .sourceMaps();