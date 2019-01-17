const postcss = require('postcss');
//移除自定义函数, 提示用@mixin
const postCssWalkAtFunction = postcss.plugin('pistcss-plugin-walk-at-@function', ()=>{
    return (root)=>{
        root.walkAtRules((rule) => {
            if (rule.name !== 'function') return;
            rule.remove();
            console.log(
                '\n' + 'Warning: ' +chalk.yellow('不支持函数指令@function, 请使用@mixin') + '\n',
                `    at ${rule.source.input.file}:${rule.source.start.line}:${rule.source.start.column}`
            );
        });
    };
});

module.exports = postCssWalkAtFunction;
