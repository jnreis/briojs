import { getLength } from '../../core/native';
export function extractModifiers(attrName: string): { baseName: string; modifiers: Record<string, boolean> } {
    if (attrName.indexOf('.') === -1) return { baseName: attrName, modifiers: {} };
    const parts = attrName.split('.');
    const baseName = parts[0];
    const modifiers: Record<string, boolean> = {};
    for (let i = 1; i < getLength(parts); i++) {
        modifiers[parts[i]] = true;
    }
    return { baseName, modifiers };
}
