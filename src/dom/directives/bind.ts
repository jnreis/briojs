import {
    isString,
    isObjectType,
    getLength,
    isArray,
    objectEntries,
    arrayFrom,
    createSyntaxError,
    deleteItem,
    startsWith,
} from '../../core/native';
import { getAttribute, removeAttribute } from '../native';
import { evaluate } from '../../core/expression';
import { effect } from '../../reactivity/effect';
import { causedError } from '../../core/errors';

const staticClasses = new WeakMap<Element, Set<string>>();
const dynamicStyles = new WeakMap<Element, Set<string>>();

export const setBoundValue = (element: Element, name: string, value: unknown, forceProp: boolean = false) => {
    if (name === 'class') {
        let staticNames = staticClasses.get(element);
        if (!staticNames) {
            staticNames = new Set((getAttribute(element, 'class') ?? '').split(/\s+/).filter(Boolean));
            staticClasses.set(element, staticNames);
        }
        const currentDynamic = new Set<string>();
        if (isString(value))
            value.split(/\s+/).filter(Boolean).forEach(className => currentDynamic.add(className));
        else if (isArray(value))
            value.filter(Boolean).forEach(className => String(className).split(/\s+/).filter(Boolean).forEach(name => currentDynamic.add(name)));
        else if (value && isObjectType(value)) {
            for (const [className, enabled] of objectEntries(value))
                if (enabled) className.split(/\s+/).filter(Boolean).forEach(name => currentDynamic.add(name));
        }
        const combined = new Set([...staticNames, ...currentDynamic]);
        if (combined.size) element.setAttribute('class', arrayFrom(combined).join(' '));
        else removeAttribute(element, 'class');
        return;
    }
    if (name === 'style' && value && isObjectType(value)) {
        const style = (element as HTMLElement).style;
        const previousProperties = dynamicStyles.get(element) ?? new Set<string>();
        const currentProperties = new Set<string>();
        const properties = objectEntries(value as Record<string, unknown>);
        for (const [property] of properties) {
            const normalized = property.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
            currentProperties.add(normalized);
            deleteItem(previousProperties, normalized);
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

    if (forceProp || (name in element && !startsWith(name, 'aria-') && !startsWith(name, 'data-'))) {
        try {
            (element as unknown as Record<string, unknown>)[name] = value;
            return;
        } catch (error) {
            if (forceProp) throw causedError(`Unable to bind property "${name}" on <${element.tagName.toLowerCase()}>.`, error);
        }
    }
    if (value === null || value === undefined || value === false) removeAttribute(element, name);
    else element.setAttribute(name, value === true ? '' : String(value));
};

export function handleBind(
    element: Element,
    attrName: string,
    expression: string,
    modifiers: Record<string, boolean>,
    context: Record<PropertyKey, any>,
): void {
    const rawTarget = startsWith(attrName, 'b-bind-')
        ? attrName.slice(getLength('b-bind-'))
        : attrName.slice(getLength('bind-'));
    if (!rawTarget) throw createSyntaxError(`Brio binding directive "${attrName}" has no target.`);
    
    const forceProp = Boolean(modifiers.prop);
    effect(() => {
        const value = evaluate(expression, context);
        setBoundValue(element, rawTarget, value, forceProp);
    });
}
