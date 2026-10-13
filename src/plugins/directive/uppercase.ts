import { evalEffect } from "../../app";

let hydrateUpperCase = (bnode: BNode, _attrName: string, attrValue: string) => {
    evalEffect(bnode, attrValue, ctxFn => {
        bnode.el.textContent = String(ctxFn() ?? '').toUpperCase();
    });
}

export let uppercaseDirective: Directive = ['b-uppercase', hydrateUpperCase];