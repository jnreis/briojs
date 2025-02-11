// Example of a custom directive

let hydrateUpperCase = (vnode: VNode, attrName: string, attrValue: string) => {
    // Evaluate the attribute value as an effect
    vnode.evalEffect(vnode, attrName, attrValue, (node) => (value) => {
        node.textContent = value().toUpperCase();
    });
}

export let uidDirective: Directive = ['b-uppercase', hydrateUpperCase];