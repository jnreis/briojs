let idCounter = 0;

export function generateScopeId(): string {
    return `b-${++idCounter}`;
}

export function scopeCss(content: string, scopeAttr: string): string {
    const attrSelector = `[${scopeAttr}]`;

    // Handle nested or multiple selectors simply using regex or CSSStyleSheet
    if (typeof CSSStyleSheet !== 'undefined' && 'replaceSync' in CSSStyleSheet.prototype) {
        try {
            const sheet = new CSSStyleSheet();
            sheet.replaceSync(content);
            const scopeRules = (rules: CSSRuleList): string => {
                let result = '';
                for (const rule of Array.from(rules)) {
                    if (rule instanceof CSSStyleRule) {
                        const scopedSelectors = rule.selectorText
                            .split(',')
                            .map(sel => {
                                const trimmed = sel.trim();
                                if (trimmed.includes('&')) {
                                    return trimmed.replace(/&/g, attrSelector);
                                }
                                return `${trimmed}${attrSelector}, ${attrSelector} ${trimmed}`;
                            })
                            .join(', ');
                        result += `${scopedSelectors} { ${rule.style.cssText} }\n`;
                    } else if (rule instanceof CSSGroupingRule) {
                        result += `@${(rule as any).name || 'media'} ${rule.conditionText} {\n${scopeRules(rule.cssRules)}\n}\n`;
                    } else {
                        result += `${rule.cssText}\n`;
                    }
                }
                return result;
            };
            return scopeRules(sheet.cssRules);
        } catch {
            // fallback if CSSStyleSheet parsing encounters issues
        }
    }

    // Fallback regex selector prefixing
    return content.replace(/([^{};]+)({)/g, (match, selector, brace) => {
        const trimmed = selector.trim();
        if (trimmed.startsWith('@')) return match;
        const scoped = trimmed
            .split(',')
            .map((s: string) => `${s.trim()}${attrSelector}`)
            .join(', ');
        return `${scoped} ${brace}`;
    });
}

export function injectScopedStyles(styleContent: string, scopeAttr: string): HTMLStyleElement {
    const styleEl = document.createElement('style');
    styleEl.setAttribute('data-brio-scoped', scopeAttr);
    styleEl.textContent = scopeCss(styleContent, scopeAttr);
    document.head.appendChild(styleEl);
    return styleEl;
}
