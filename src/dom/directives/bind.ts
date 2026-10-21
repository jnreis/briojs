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
    objectConstructor,
    GET_OWN_PROPERTY_DESCRIPTOR,
} from '../../core/native';
import { getAttribute, removeAttribute } from '../native';
import { evaluate } from '../../core/expression';
import { effect } from '../../reactivity/effect';
import { causedError, errorText } from '../../core/errors';

const staticClasses = new WeakMap<Element, Set<string>>();
const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
// Mixed-case SVG attributes from the HTML parser's adjustment table; the parser lowercases `b-bind-viewBox`.
const svgAttributeNames = 'attributeName attributeType baseFrequency calcMode clipPathUnits diffuseConstant edgeMode filterUnits gradientTransform gradientUnits kernelMatrix kernelUnitLength keyPoints keySplines keyTimes lengthAdjust limitingConeAngle markerHeight markerUnits markerWidth maskContentUnits maskUnits numOctaves pathLength patternContentUnits patternTransform patternUnits pointsAtX pointsAtY pointsAtZ preserveAlpha preserveAspectRatio primitiveUnits refX refY repeatCount repeatDur requiredExtensions specularConstant specularExponent spreadMethod startOffset stdDeviation stitchTiles surfaceScale systemLanguage tableValues targetX targetY textLength viewBox xChannelSelector yChannelSelector';
let svgNames: Map<string, string> | undefined;

const findProperty = (element: Element, name: string): PropertyDescriptor | undefined => {
    for (let target: object | null = element; target; target = objectConstructor.getPrototypeOf(target)) {
        const descriptor = objectConstructor[GET_OWN_PROPERTY_DESCRIPTOR](target, name);
        if (descriptor) return descriptor;
    }
};

/** Recovers the casing the HTML parser removed from the attribute name. */
export const resolveBindTarget = (element: Element, name: string, forceProp: boolean): string => {
    if (forceProp) {
        if (name in element) return name;
        for (let target: object | null = element; target; target = objectConstructor.getPrototypeOf(target))
            for (const key of objectConstructor.getOwnPropertyNames(target))
                if (key.toLowerCase() === name) return key;
        return name;
    }
    if (element.namespaceURI !== SVG_NAMESPACE) return name;
    svgNames ??= new Map(svgAttributeNames.split(' ').map(attribute => [attribute.toLowerCase(), attribute]));
    return svgNames.get(name) ?? name;
};
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

    const aria = startsWith(name, 'aria-');
    // ARIA states are enumerated strings: "" means false/undefined and a missing attribute drops the state.
    if (aria && (value === true || value === false)) value = String(value);
    // Getter-only properties (SVG geometry such as `r`/`cx`, `input.form`/`list`) are bound as attributes.
    const descriptor = forceProp || aria || startsWith(name, 'data-') || !(name in element)
        ? undefined : findProperty(element, name);
    if (forceProp || descriptor?.set || descriptor?.writable) {
        try {
            (element as unknown as Record<string, unknown>)[name] = value;
            return;
        } catch (error) {
            throw causedError(`Unable to bind property "${name}" on <${element.tagName.toLowerCase()}>: ${errorText(error)}`, error);
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
    const target = resolveBindTarget(element, rawTarget, forceProp);
    effect(() => {
        const value = evaluate(expression, context, attrName, element);
        setBoundValue(element, target, value, forceProp);
    });
}
