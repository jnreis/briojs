import { objectConstructor, isArray, deleteItem } from '../../core/native';
import { evaluate, createExpressionScope } from '../../core/expression';
import { onCleanup } from '../../core/scope';

let idSeq = 0;
const activeIds = new Set<string>();

export function handleId(
    _element: Element,
    expression: string,
    _modifiers: Record<string, boolean>,
    context: Record<PropertyKey, any>,
): Record<PropertyKey, any> {
    const evaluated = expression ? evaluate(expression, context) : ['id'];
    const idList = isArray(evaluated) ? evaluated : [String(evaluated)];

    const idMap: Record<string, string> = {};
    for (const name of idList) {
        const generated = `brio-${++idSeq}`;
        activeIds.add(generated);
        idMap[name] = generated;
    }

    onCleanup(() => {
        for (const val of objectConstructor.values(idMap)) {
            deleteItem(activeIds, val);
        }
    });

    return createExpressionScope({ $id: idMap }, context);
}
