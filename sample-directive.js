// ! This is just a example of how to create a custom directive for Brio.js using JS.
// ! In this example, we are using the hydration `tools` provided by Brio.js to hydrate the innerHTML of a node.
// ! UglifyJS is used to minify the code for production.

!(function(){

    let hydrateHtml = (vnode, attrName, attrValue, tools) => {

        let callback = (node) => (value) => node.innerHTML = value;

        tools.wrapper(vnode, attrName, attrValue, callback);
    }

    // Register the directive
    document.addEventListener('brio:init', () => {
        Brio.addDirective(
            Brio.attrNameEquals('html'),
            hydrateHtml
        );
    });

})();

// To minify for production, run:
// npm install uglify-js -g
// uglifyjs scripts/directive.js -o scripts/html.min.js -c -m