function toggleNode(node: HTMLElement | Text | Comment) {
    if (![1,3,8].includes(node.nodeType)) {
        console.warn("Invalid node type");
        return null;
    }

    // Store references to parent and siblings
    const parentElement = node.parentElement;
    const nextSibling = node.nextSibling;

    return {
        add() {
            if (nextSibling) {
                parentElement?.insertBefore(node, nextSibling);
            } else {
                parentElement?.appendChild(node);
            }
        },
        remove() {
            node.remove();
        },
        toggle() {
            if (node.parentElement) {
                node.remove();
            } else {
                this.add();
            }
        }
    }
}