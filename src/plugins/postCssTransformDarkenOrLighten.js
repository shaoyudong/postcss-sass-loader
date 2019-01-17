const postcss = require('postcss');
/**
 * 解析sass darken和lighten函数
 * darken($color: #fff, $amount: 10) => darken(#fff, 10%);
 * lighten($color: #000, $amount: 100) => lighten(#000, 100%);
 * */
const postCssTransformDarkenOrLighten = postcss.plugin('postcss-plugin-darken-lighten-fn', ()=>{
    return (root)=>{
        root.walkRules((rule)=>{
            rule.walkDecls( (decl) => {
                if ( /^(darken|lighten)\b/.test(decl.value) ) {
                    decl.value = decl.value.replace(/\$(color|amount)\s*:|%|\s/g, '')  
                        .replace(/,(\d+)/, function(a){
                            return a+'%';
                        });
                }
            });
        });
    };
});

module.exports = postCssTransformDarkenOrLighten;
