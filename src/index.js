const path = require('path');
const postcss = require('postcss');
const { getOptions } = require('loader-utils');
const parseOptions = require('./options');
const validateOptions = require('schema-utils');
const postcssrc = require('postcss-load-config');
const SyntaxError = require('./Error');
const Warning = require('./Warning.js');

module.exports = function(css, map, meta) {
    const options = Object.assign({}, getOptions(this));

    validateOptions(require('./options.json'), options, 'PostCSS Loader');

    const cb = this.async();
    const file = this.resourcePath;
    const sourceMap = options.sourceMap;

    Promise.resolve().then(() => {
        const length = Object.keys(options)
            .filter((option) => {
                switch (option) {
                case 'ident':
                case 'config':
                case 'sourceMap':
                    return
                default:
                    return option
                }
            }).length;

        if (length) {
            return parseOptions.call(this, options);
        }
        const rc = {
            path: path.dirname(file),
            ctx: {
              file: {
                extname: path.extname(file),
                dirname: path.dirname(file),
                basename: path.basename(file)
              },
              options: {}
            }
          }
      
          if (options.config) {
            if (options.config.path) {
              rc.path = path.resolve(options.config.path)
            }
      
            if (options.config.ctx) {
              rc.ctx.options = options.config.ctx
            }
          }
      
          rc.ctx.webpack = this;
      
          return postcssrc(rc.ctx, rc.path)
      }).then((config) => {
        if (!config) {
          config = {}
        }
        const sassPlugins = [
            require('postcss-import')({
                resolve(importer){
                    //如果@import的值没有文件后缀
                    if (!/\.s[ca]ss$/.test(importer)) {
                        importer = importer + '.scss';
                    }
                    const [prefix, ...rest] = importer.split('/');
                    if (config.options && config.options.alias && config.options.alias[prefix]) {
                        importer = [config.options.alias[prefix], ...rest].join('/');
                    }
                    return importer;
                }
            }),
            require('@csstools/postcss-sass')
        ];
        let plugins = config.plugins || [];
        if (config.file) this.addDependency(config.file)

        // Disable override `to` option from `postcss.config.js`
        if (config.options.to) delete config.options.to
        // Disable override `from` option from `postcss.config.js`
        if (config.options.from) delete config.options.from
    
        let options = Object.assign({
          from: file,
          map: sourceMap
            ? sourceMap === 'inline'
              ? { inline: true, annotation: false }
              : { inline: false, annotation: false }
            : false
        }, config.options)
    
        if (typeof options.parser === 'string') {
          options.parser = require(options.parser)
        }
    
        if (typeof options.syntax === 'string') {
          options.syntax = require(options.syntax)
        }
    
        if (typeof options.stringifier === 'string') {
          options.stringifier = require(options.stringifier)
        }
    
        if (sourceMap && typeof map === 'string') {
          map = JSON.parse(map)
        }
    
        if (sourceMap && map) {
          options.map.prev = map
        }
        return postcss(sassPlugins.concat(plugins))
                .process(css, Object.assign({}, options, {
                    parser: require('postcss-scss')
                }))
                .then(result => {
                    let { css, map, root, processor, messages } = result;
    
                    result.warnings().forEach((warning) => {
                        this.emitWarning(new Warning(warning))
                    })
            
                    messages.forEach((msg) => {
                    if (msg.type === 'dependency') {
                        this.addDependency(msg.file)
                    }
                    })
            
                    map = map ? map.toJSON() : null
            
                    if (map) {
                        map.file = path.resolve(map.file)
                        map.sources = map.sources.map((src) => path.resolve(src))
                    }
            
                    if (!meta) {
                        meta = {}
                    }
            
                    const ast = {
                        type: 'postcss',
                        version: processor.version,
                        root
                    }
            
                    meta.ast = ast
                    meta.messages = messages
            
                    if (this.loaderIndex === 0) {
                        /**
                         * @memberof loader
                         * @callback cb
                         *
                         * @param {Object} null Error
                         * @param {String} css  Result (JS Module)
                         * @param {Object} map  Source Map
                         */
                        cb(null, `module.exports = ${JSON.stringify(css)}`, map)
                
                        return null
                    }
            
                    /**
                     * @memberof loader
                     * @callback cb
                     *
                     * @param {Object} null Error
                     * @param {String} css  Result (Raw Module)
                     * @param {Object} map  Source Map
                     */
                    cb(null, css, map, meta)
            
                    return null
                });
            }).catch((err) => {
                if (err.file) {
                    this.addDependency(err.file)
                }

                return err.name === 'CssSyntaxError'
                    ? cb(new SyntaxError(err))
                    : cb(err);
            })
}
