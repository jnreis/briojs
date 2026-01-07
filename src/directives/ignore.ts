import { B_IGNORE, SKIP } from "../tools/constants";

let hydrateIgnore = async (bnode: BNode, _attrName: string) => {
    bnode[SKIP] = 3;
}

export let ignoreDirective: Directive = [B_IGNORE, hydrateIgnore];