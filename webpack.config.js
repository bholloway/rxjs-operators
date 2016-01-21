module.exports = {
  devtool  : 'sourcemap',
  entry    : [
    './index.js'
  ],
  output   : {
    path         : './dist',
    filename     : 'index.js',
    library      : 'RxOperators',
    libraryTarget: 'umd'
  },
  resolve  : {
    extensions: ['', '.js']
  },
  module   : {},
  externals: {
    rxjs: 'Rx'
  }
};