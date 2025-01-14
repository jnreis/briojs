export let hydrateUpperCase = (vnode: VNode, attrName: string, attrValue: string, tools: HydrationTools) => {
    // Evaluate the attribute value as an effect
    tools.evalEffect(vnode, attrName, attrValue, (node) => ([value]) => {
        node.textContent = value().toUpperCase();
    });
}

try {
    // @ts-ignore
    $set.directive('b-uppercase', hydrateUpperCase);
} catch {
    console.error('Could not set the "b-uppercase" directive.');
}