module.exports = {
    resolveStyleAlias(importer, basedir, config = {}) {
        //解析样式中的alias别名配置
        let aliasMap = config.alias || {};
        let depLevel = importer.split('/'); //'@path/x/y.scss' => ['@path', 'x', 'y.scss']
        let prefix = depLevel[0];
    
        //将alias以及相对路径引用解析成绝对路径
        if (aliasMap[prefix]) {
          importer = path.join(
            cwd,
            aliasMap[prefix],
            depLevel.slice(1).join('/') //['@path', 'x', 'y.scss'] => 'x/y.scss'
          );
          let val = path.relative(basedir, importer);
          val = /^\w/.test(val) ? `./${val}` : val; //相对路径加./
          return val;
        }
        return importer;
    }
};
