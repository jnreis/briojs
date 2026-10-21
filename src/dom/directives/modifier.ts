import { getLength, objectConstructor } from '../../core/native';

type ParsedName = { baseName: string; modifiers: Readonly<Record<string, boolean>> };
const noModifiers: Readonly<Record<string, boolean>> = objectConstructor.freeze({});
// Attribute names repeat across every clone of a template, so each distinct name is parsed once.
const parsedNames = new Map<string, ParsedName>();

export function extractModifiers(attrName: string): ParsedName {
    let parsed = parsedNames.get(attrName);
    if (parsed) return parsed;
    if (attrName.indexOf('.') === -1) parsed = { baseName: attrName, modifiers: noModifiers };
    else {
        const parts = attrName.split('.');
        const modifiers: Record<string, boolean> = {};
        for (let i = 1; i < getLength(parts); i++) modifiers[parts[i]] = true;
        parsed = { baseName: parts[0], modifiers: objectConstructor.freeze(modifiers) };
    }
    if (parsedNames.size > 1000) parsedNames.clear();
    parsedNames.set(attrName, objectConstructor.freeze(parsed));
    return parsed;
}
