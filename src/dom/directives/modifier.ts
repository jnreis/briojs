export function extractModifiers(attrName: string): { baseName: string; modifiers: Record<string, boolean> } {
    const parts = attrName.split('.');
    const baseName = parts[0];
    const modifiers: Record<string, boolean> = {};
    for (let i = 1; i < parts.length; i++) {
        modifiers[parts[i]] = true;
    }
    return { baseName, modifiers };
}
