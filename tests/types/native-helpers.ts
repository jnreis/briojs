import {
    arrayFrom, isArray, objectEntries, objectKeys, isString, isObjectType, isNumber, isBoolean, isFunction,
    getLength, ObjectConstructor, ReflectApi, isInstanceOf, removeElement, deleteItem, includesItem, startsWith,
} from '../../src/core/native';
import {
    addEventListener, removeEventListener, getOwnerDocument, getChildNodes, insertBefore,
} from '../../src/dom/native';

const options: HTMLOptionElement[] = arrayFrom(document.createElement('select').options);
const values: number[] = arrayFrom(options, option => Number(option.value));
const entries: [string, number][] = objectEntries({ total: 2 });
const keys: string[] = objectKeys({ total: 2 });
const owner: Document = getOwnerDocument(document.createElement('div'));
const children: NodeListOf<ChildNode> = getChildNodes(document.body);
const inserted: HTMLInputElement = insertBefore(document.body, document.createElement('input'), null);
const unknownValue: unknown = values;
if (isArray(unknownValue)) unknownValue.push(3);
declare const input: unknown;
if (isString(input)) input.toUpperCase();
if (isNumber(input)) input.toFixed();
if (isBoolean(input)) input.valueOf();
if (isFunction(input)) input.call(null);
if (isObjectType(input)) {
    // @ts-expect-error typeof null is object; the predicate must retain null.
    const nonNull: object = input;
    void nonNull;
}
const length: number = getLength('text');
// @ts-expect-error length requires a length-bearing value.
getLength({});
const reflected: unknown = ReflectApi.get({ value: 1 }, 'value');
const frozen: Readonly<{ value: number }> = ObjectConstructor.freeze({ value: 1 });
declare const candidate: unknown;
if (isInstanceOf(candidate, HTMLInputElement)) candidate.value = 'typed';
if (isInstanceOf(candidate, Promise)) candidate.then(value => value);
abstract class AbstractValue { abstract value: string }
if (isInstanceOf(candidate, AbstractValue)) candidate.value.toUpperCase();
removeElement(document.createElement('div'));
removeElement(document.createComment(''));
removeElement(undefined);
// @ts-expect-error removeElement requires an object with a remove method.
removeElement({});
const setDeleted: boolean | undefined = deleteItem(new Set([1]), 1);
const mapDeleted: boolean | undefined = deleteItem(new Map<string, number>(), 'key');
const optionalDeleted: boolean | undefined = deleteItem(undefined, 'key');
const included: boolean = includesItem([1, 2] as const, 2);
const hasPrefix: boolean = startsWith('brio', 'br');
// @ts-expect-error deleteItem preserves collection key/value types.
deleteItem(new Set<number>(), 'key');
// @ts-expect-error includesItem preserves collection item types.
includesItem(['value'], 1);
// @ts-expect-error the right-hand side must be a constructor.
isInstanceOf(candidate, {});
addEventListener(window, 'storage', event => event.storageArea);
removeEventListener(window, 'storage', event => event.newValue);
addEventListener(document.body, 'click', event => event.target, { once: true, passive: true });
// @ts-expect-error addEventListener options are not accepted by removal.
removeEventListener(document.body, 'click', () => {}, { once: true });
// @ts-expect-error array mapping preserves the result type.
const invalid: string[] = arrayFrom(options, option => Number(option.value));
void [
    entries, keys, owner, children, inserted, invalid, length, reflected, frozen,
    setDeleted, mapDeleted, optionalDeleted, included, hasPrefix,
];
