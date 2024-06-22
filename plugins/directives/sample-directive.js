/**
 * ! This is just a example of how to create a custom directive for Brio.js using JS.
 * 
 * Use UglifyJS to minify the code for production.
 * 
 * Use UglifyJS online:
 * - https://skalman.github.io/UglifyJS-online/
 * 
 * Or install UglifyJS:
 * - npm install uglify-js -g
 * - uglifyjs my-directive.js -o my-directive.min.js -c -m
 */

// Register the directive
document.addEventListener('brio:init', () => {
    Brio.addDirective('uppercase', false, (vnode, attrName, attrValue, tools) => {
        tools.wrapper(vnode, attrName, attrValue, (node) => (value) => {
            node.textContent = value.toUpperCase();
        });
    });
});