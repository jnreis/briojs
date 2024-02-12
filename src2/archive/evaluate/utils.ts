export function getArgs(fn: string) {
    const regex = /\(\s*([^)]*?)\s*\)\s*=>|(\w+)\s*=>|\w+\s*\(([^)]*?)\)\s*|function\s*\(\s*([^)]*?)\s*\)\s*{/g;

    const matches = [];
    let match;
    while ((match = regex.exec(fn)) !== null) {
        const args = match[1] || match[2] || match[3];
        if (args) {
            // Split the arguments and remove empty strings
            const argArray = args.split(/\s*,\s*/).filter(arg => arg !== '');
            matches.push(argArray);
        }
    }

    return matches;
}

export function processExpression(expression: string, scope: any) {
    const readRegex = /\b([a-zA-Z_$][0-9a-zA-Z_$]*)\b/g;
    const assignRegex = /\b([a-zA-Z_$][0-9a-zA-Z_$]*)\.value(\.[^\s=]+)*\s*=\s*(`.*`|'.*'|".*"|{.*}|\[.*\]|[0-9.,]+|[a-zA-Z_$!][0-9a-zA-Z_$.]*)/g;

    // Handle reading reactive variables
    const readProcessedExpression = expression.replace(readRegex, (match, p1) => {
        if (scope[p1] && scope[p1].isReactive) {
            return `${p1}.value`;
        }
        return match;
    });

    // Handle reassignment of reactive variables
    const assignProcessedExpression = readProcessedExpression.replace(assignRegex, (match, p1, p2, p3) => {
        if (scope[p1] && scope[p1].isReactive) {
            if (!p2 || p2 && p2.trim() === '') {
                // No path provided, reassess the whole variable
                return `${p1}.set(${p3})`;
            } else {
                // Path is provided, reassess with path
                return `${p1}.set(${p3.trim()}, '${p2.trim().slice(1).split('.').filter(p => p).join('.')}')`;
            }
        }
        return match;
    });

    return assignProcessedExpression;
}

export function getArgs2(str: string) {
    let args = '';
    let fnRegex = [   // Arrow function with one argument and no parentheses
        /^(async\s+)?([a-zA-Z_$][0-9a-zA-Z_$]*)\s*=>/,
        // Arrow function with any number of arguments and parentheses
        /^(async\s+)?(\(\s*([^)]*?)\s*\))\s*=>/,
        // Regular function with any number of arguments
        /^(async\s+)?function\s*(\(\s*([^)]*?)\s*\))\s*{/,
    ]
    for (const regex of fnRegex) {
        const m = regex.exec(str.trim())
        if (m) {
            args = m[1] ? m[1] + m[2] : m[2]
        }
    }
    return args
}