'use strict'

// This file has two parts:
// The regular webpack config, enclosed in this function,
// And handle_myou_config below to use in other webpack configs.

module.exports = (env) => {
    var webpack = require('webpack');
    var config = {
        context: __dirname,
        entry: [
            __dirname + '/pack.coffee',
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
                    ]
                },
            ]
        },
        output: {
            path: __dirname + '/dist/',
            filename: 'myou.js',
            // export commonjs2 and var at the same time
            library: 'MyouEngine = module.exports',
        },
        plugins: [
            new webpack.BannerPlugin({
                banner: [
                    '"use strict";',
                    '/**',
                    ' * Myou Engine',
                    ' *',
                    ' * Copyright (c) 2017 by Alberto Torres Ruiz <kungfoobar@gmail.com>',
                    ' * Copyright (c) 2017 by Julio Manuel López Tercero <julio@pixelements.net>',
                    ' *',
                    ' * Permission is hereby granted, free of charge, to any person obtaining a copy',
                    ' * of this software and associated documentation files (the "Software"), to deal',
                    ' * in the Software without restriction, including without limitation the rights',
                    ' * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell',
                    ' * copies of the Software, and to permit persons to whom the Software is',
                    ' * furnished to do so, subject to the following conditions:',
                    ' *',
                    ' * The above copyright notice and this permission notice shall be included in',
                    ' * all copies or substantial portions of the Software.',
                    ' *',
                    ' * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR',
                    ' * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,',
                    ' * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE',
                    ' * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER',
                    ' * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,',
                    ' * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE',
                    ' * SOFTWARE.',
                    ' */'
                ].join('\n'),
                raw: true,
            }),
        ],
        resolve: {
            extensions: ['.webpack.js', '.web.js', '.js', '.coffee', '.json']
        },
    }

    env = env || {}
    if(env.sourcemaps){
        config.devtool = 'cheap-module-eval-source-map';
    }
    return config;
}

var fs = require('fs-extra');
var path = require('path'), join = path.join;

// This function will use the flags of the project to copy libraries,
// And to touch the config (currently just adding the flags to the code)
module.exports.handle_myou_config = function(webpack, config, flags, env){
    function copy_lib(name){
        console.log('Copying library '+name);
        fs.ensureDirSync(join(config.output.path, 'libs'));
        fs.copySync(
            join(__dirname, 'engine', 'libs', name),
            join(config.output.path, 'libs', name)
        );
    }
    if(flags.copy_bullet == null) flags.copy_bullet = true;
    if(flags.include_bullet && flags.copy_bullet){
        copy_lib('ammo.asm.js');
        copy_lib('ammo.wasm.js');
    }
    config.plugins = config.plugins || [];
    config.plugins.push(new webpack.DefinePlugin({
        global_myou_engine_webpack_flags: JSON.stringify(flags),
    }));
    return config;
}
