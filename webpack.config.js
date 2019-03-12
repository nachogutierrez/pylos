const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  mode: 'development',
  entry: {
      home: './src/js/views/home/index.js',
      play: './src/js/views/play/index.js'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist')
  },
  plugins: [
    new CopyWebpackPlugin([
      { from: './src/index.html' },
      { from: './src/play.html' },
      { from: './src/css', to: 'css/' }
    ])
  ]
};
