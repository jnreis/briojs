import { evaluate } from '../../core/expression';
import { effect } from '../../reactivity/effect';
import { causedError } from '../../core/errors';
import { getStyleClass } from '../scoped-style';

const staticClasses = new WeakMap<Element, Set<string>>();
const dynamicStyles = new WeakMap<Element, Set<string>>();

export const setBoundValue = (element: Element, name: string, value: unknown, forceProp: boolean = false) => {
    if (name === 'class') {
        let staticNames = staticClasses.get(element);
        if (!staticNames) {
            staticNames = new Set((element.getAttribute('class') ?? '').split(/\s+/)
                .filter(name => Boolean(name) && name !== getStyleClass(element)));
            staticClasses.set(element, staticNames);
        }
        const currentDynamic = new Set<string>();
        if (typeof value === 'string')
            value.split(/\s+/).filter(Boolean).forEach(className => currentDynamic.add(className));
        else if (Array.isArray(value))
            value.filter(Boolean).forEach(className => String(className).split(/\s+/).filter(Boolean).forEach(name => currentDynamic.add(name)));
        else if (value && typeof value === 'object') {
            for (const [className, enabled] of Object.entries(value))
                if (enabled) className.split(/\s+/).filter(Boolean).forEach(name => currentDynamic.add(name));
        }
        const combined = new Set([...staticNames, ...currentDynamic]);
        const styleClass = getStyleClass(element);
        if (styleClass) combined.add(styleClass);
        if (combined.size) element.setAttribute('class', Array.from(combined).join(' '));
        else element.removeAttribute('class');
        return;
    }
    if (name === 'style' && value && typeof value === 'object') {
        const style = (element as HTMLElement).style;
        const previousProperties = dynamicStyles.get(element) ?? new Set<string>();
        const currentProperties = new Set<string>();
        const properties = Object.entries(value as Record<string, unknown>);
        for (const [property] of properties) {
            const normalized = property.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
            currentProperties.add(normalized);
            previousProperties.delete(normalized);
        }
        for (const property of previousProperties) style.removeProperty(property);
        for (const [property, propertyValue] of properties) {
            const normalized = property.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
            if (propertyValue === null || propertyValue === undefined || propertyValue === false)
                style.removeProperty(normalized);
            else style.setProperty(
                normalized,
                String(propertyValue),
            );
        }
        dynamicStyles.set(element, currentProperties);
        return;
    }

    if (forceProp || (name in element && !name.startsWith('aria-') && !name.startsWith('data-'))) {
        try {
            (element as unknown as Record<string, unknown>)[name] = value;
            return;
        } catch (error) {
            if (forceProp) throw causedError(`Unable to bind property "${name}" on <${element.tagName.toLowerCase()}>.`, error);
        }
    }
    if (value === null || value === undefined || value === false) element.removeAttribute(name);
    else element.setAttribute(name, value === true ? '' : String(value));
};

export function handleBind(
    element: Element,
    attrName: string,
    expression: string,
    modifiers: Record<string, boolean>,
    context: Record<PropertyKey, any>,
): void {
    const rawTarget = attrName.startsWith('b-bind-')
        ? attrName.slice('b-bind-'.length)
        : attrName.slice('bind-'.length);
    if (!rawTarget) throw new SyntaxError(`Brio binding directive "${attrName}" has no target.`);
    
    const forceProp = Boolean(modifiers.prop);
    effect(() => {
        const value = evaluate(expression, context);
        setBoundValue(element, rawTarget, value, forceProp);
    });
}
