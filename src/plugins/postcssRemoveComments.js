const postcss = require('postcss');
const postCssRemoveComments = postcss.plugin('postcss-plugin-remove-comment', ()=>{
    return (root)=>{
        root.walkComments(comment => {
            comment.remove();
        });
    };
});

module.exports = postCssRemoveComments;
