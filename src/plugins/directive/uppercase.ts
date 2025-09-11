// Example of a custom directive

let hydrateUpperCase = (bnode: BNode, attrName: string, attrValue: string) => {
    // Evaluate the attribute value as an effect
    bnode.evalEffect(bnode, attrName, attrValue, (node) => (value) => {
        node.textContent = value().toUpperCase();
    });
}

export let uidDirective: Directive = ['b-uppercase', hydrateUpperCase];