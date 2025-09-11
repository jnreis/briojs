import { B_IGNORE, SKIP } from "../tools/constants";

export let hydrateIgnore = async (bnode: BNode, _attrName: string) => {
    bnode[SKIP] = true;
}

export let ignoreDirective: Directive = [B_IGNORE, hydrateIgnore];