let webpack = require('webpack')
let path = require('path')


let config = {
    mode: 'production',
    devtool: 'source-map',
    entry: path.resolve(__dirname, 'easy.js'),
    output: {
        path: path.resolve(__dirname, 'lib'),
        filename: 'so-so-easy.js',
        library: '__',
        libraryTarget: 'var',
        libraryExport: 'default'
    }, 
}


module.exports = config
