import { entries, has, logWarn, size } from "../tools";
import { arrayAdd, join } from "../tools/array";
import { EMAIL, MESSAGE, MUST_BE, OF_TYPE, REQUIRED, VALID, VALUE } from "../tools/constants";
import { countKeys, newRegExp } from "../tools/object";
import { capitalize, replaceAll, space, test } from "../tools/string";
import { getType, isArray, isNumber, isObject, isString } from "../tools/typeCheck";

let MATCHES: 'matches' = 'matches';
let CHARACTERS_LONG: ' characters long.' = ' characters long.';
let regexLetters = '\\p{L}';
let regexNumbers = '\\p{Nd}';
let regexEmail = newRegExp(replaceAll(replaceAll('^(?!.*\\.{2})[w._%+-]+@(?:[w](?:[w-]*[w])?\\.)+[l]{2,}$', /w/, regexLetters + regexNumbers), /l/, regexLetters), 'u');

export let validate = (data: ObjectType, schema: SchemaObject, customRules?: RulesObject, customMessages?: MessageObject) => {
    let errors: ObjectType = {};
    if (!data) data = {};

    let minMax = (value: any, ruleValue: any, isMin: boolean) => {
        let r = false;
        if (isString(value) || isArray(value)) r = isMin ? size(value) >= ruleValue : size(value) <= ruleValue;
        if (isNumber(value)) r = isMin ? value >= ruleValue : value <= ruleValue;
        return r;
    }

    let rules: RulesObject = {
        [REQUIRED]: (value: any) => {
            if (value === null || value === undefined || value === false || value === '') return false;
            if (isString(value)) return !!value.trim();
            if (isArray(value)) return size(value) > 0;
            if (isObject(value)) return countKeys(value) > 0;
            return true;
        },

        min: (value: any, ruleValue: any) => minMax(value, ruleValue, true),

        max: (value: any, ruleValue: any) => minMax(value, ruleValue, false),

        [EMAIL]: (value: any) => isString(value) && test(value, regexEmail),

        same: (value: any, ruleValue: any, data: any) => value === data[ruleValue],
    
        in: (value: any, ruleValue: any) => isArray(ruleValue) && has(ruleValue, value),
    
        [MATCHES]: (value: any, ruleValue: any) => {
            if (!isString(value) || !(ruleValue instanceof RegExp)) return false;
            ruleValue.lastIndex = 0;
            return test(value, ruleValue);
        },

        type: (value: any, ruleValue: any) => rules.in(getType(value), isArray(ruleValue) ? ruleValue : [ruleValue]),

        // Note that custom rules can override default rules
        ...customRules || {}
    };

    let messages: MessageObject = {
        // E.g. "Username is required.", "Age is required."
        [REQUIRED]: (propName: string) => space(capitalize(propName), 'is', REQUIRED + '.'),

        // E.g. "Username must be at least 3 characters long.", "Age must be at least 18."
        min: (propName: string, ruleValue: any, data: any) => space(capitalize(propName), MUST_BE, 'at least', ruleValue + (isString(data[propName]) ? CHARACTERS_LONG : '.')),

        // E.g. "Username must be at most 20 characters long.", "Age must be at most 65."
        max: (propName: string, ruleValue: any, data: any) => space(capitalize(propName), MUST_BE, 'at most', ruleValue + (isString(data[propName]) ? CHARACTERS_LONG : '.')),

        // E.g. "Email must be valid."
        [EMAIL]: () => space(capitalize(EMAIL), MUST_BE, VALID + '.'),

        // E.g. "ConfirmPassword must be the same as the password."
        same: (propName: string, ruleValue: any) => space(capitalize(propName), MUST_BE, 'the same as the', capitalize(ruleValue) + '.'),

        // E.g. "Status must be equal to active or pending."
        in: (propName: string, ruleValue: any) => space(capitalize(propName), MUST_BE, 'equal to', join(ruleValue, ' or ') + '.'),

        // E.g. "Username is invalid."
        [MATCHES]: (propName: string) => capitalize(propName) + ' is invalid.',

        // E.g. "Username must be of type string.", "Age must be of type number or string."
        type: (propName: string, ruleValue: any) => space(capitalize(propName), MUST_BE, OF_TYPE, (isArray(ruleValue) ? join(ruleValue, ' or ') : ruleValue) + '.'),

        // Note that custom messages can override default messages
        ...customMessages || {}
    };

    for (let [propName, propRules] of entries(schema || {})) {
        let value = data[propName];

        for (let {name: ruleName, [VALUE]: ruleValue, [MESSAGE]: ruleMessage} of propRules) {

            let ruleFn = rules[ruleName];

            if (ruleFn) {
                let passed = ruleFn(value, ruleValue, data);

                if (!passed) {
                    // Initialize the errors array for the property
                    if (!errors[propName]) errors[propName] = [];

                    // Custom rule message has priority over the default message
                    if (ruleMessage) {
                        arrayAdd(errors[propName], ruleMessage);
                    }
                    // Default message
                    else {
                        arrayAdd(errors[propName], messages[ruleName](propName as string, ruleValue, data) || propName + ' is invalid.');
                    }
                }
            }
            else {
                logWarn('Unknown rule: ' + ruleName);
                if (!errors[propName]) errors[propName] = [];
                arrayAdd(errors[propName], `Unknown validation rule: ${ruleName}.`);
            }
        }
    }

    return !countKeys(errors) || errors;
}