const path = require('path');
const webpack = require('webpack');
const memoryfs = require('memory-fs');

module.exports = (fixture, options = {}) => {
    const compiler = webpack({
        mode: 'development',
        context: __dirname,
        entry: path.resolve(__dirname, fixture),
        output: {
            path: path.resolve(__dirname),
            filename: 'bundle.js',
        },
        module: {
            rules: [{
                test: /\.s[ca]ss$/,
                use: {
                    loader: path.join(__dirname, '../src/index.js')
                }
            }]
        }
    });
    
    compiler.outputFileSystem = new memoryfs();

    return new Promise((resolve, reject) => {
        compiler.run((err, stats) => {
            if (err || stats.hasErrors()) reject(err || stats);
            resolve(stats);
        });
    });
};
