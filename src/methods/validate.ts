import { entries, has, logWarn, size } from "../tools";
import { arrayAdd, join } from "../tools/array";
import { A_VALID, EMAIL, MESSAGE, MUST_BE, NAME, OF_TYPE, VALIDATE, VALUE } from "../tools/constants";
import { countKeys, deleteKeys, newRegExp } from "../tools/object";
import { replaceAll, space, test } from "../tools/string";
import { getType, isArray, isNumber, isObject, isString } from "../tools/typeCheck";

let REQUIRED: 'required' = 'required';
let MATCHES: 'matches' = 'matches';
let regexLetters = '\\p{L}';
let regexNumbers = '\\p{Nd}';
let regexEmail = newRegExp(replaceAll(replaceAll('^(?!.*\\.{2})[w._%+-]+@(?:[w](?:[w-]*[w])?\\.)+[l]{2,}$', /w/, regexLetters + regexNumbers), /l/, regexLetters), 'u');

export let validate = (data: ObjectType) => {
    let props: SchemaObject = {};
    let errors: ObjectType = {};
    if (!data) data = {};

    let minMax = (value: any, ruleValue: any, isMin: boolean) => {
        let r = false;
        if (isString(value) || isArray(value)) r = isMin ? size(value) >= ruleValue : size(value) <= ruleValue;
        if (isNumber(value)) r = isMin ? value >= ruleValue : value <= ruleValue;
        return r;
    }

    let rules: Record<string, RuleFn> = {
        [REQUIRED]: (value: any) => !!value || value === 0,

        min: (value: any, ruleValue: any) => minMax(value, ruleValue, true),

        max: (value: any, ruleValue: any) => minMax(value, ruleValue, false),

        [EMAIL]: (value: any) => isString(value) && test(value, regexEmail),

        same: (value: any, ruleValue: any, data: any) => value === data[ruleValue],
    
        in: (value: any, ruleValue: any) => isArray(ruleValue) && has(ruleValue, value),
    
        [MATCHES]: (value: any, ruleValue: any) => isString(value) && test(value, ruleValue),

        type: (value: any, ruleValue: any) => rules.in(getType(value), isArray(ruleValue) ? ruleValue : [ruleValue]),
    };

    let messages: Record<string, MessageFn> = {
        [REQUIRED]: (propName: string) => space(propName, 'is', REQUIRED + '.'),

        min: (propName: string, ruleValue: any) => space(propName, MUST_BE, 'at least', ruleValue + '.'),

        max: (propName: string, ruleValue: any) => space(propName, MUST_BE, 'at most', ruleValue + '.'),

        [EMAIL]: (propName: string) => space(propName, MUST_BE, A_VALID, EMAIL + '.'),

        same: (propName: string, ruleValue: any) => space(propName, 'must match', ruleValue + '.'),

        in: (propName: string, ruleValue: any) => space(propName, MUST_BE, 'equal to', join(ruleValue, ' or ') + '.'),

        [MATCHES]: (propName: string) => propName + ' has an invalid format.',

        type: (propName: string, ruleValue: any) => space(propName, MUST_BE, OF_TYPE, (isArray(ruleValue) ? join(ruleValue, ' or ') : ruleValue) + '.'),
    };

    let prop = (name: string, rules: SchemaRules) => {
        props[name] = rules;
    }

    let rule = (name: string, fn: RuleFn, message?: MessageFn) => {
        rules[name] = fn;
        if (message) messages[name] = message;
    }

    let validate = () => {
        // Clear previous errors
        deleteKeys(errors);

        for (let [propName, propRules] of entries(props)) {
            let value = data[propName];

            for (let rule of propRules) {
                let ruleName: string = '';
                let ruleValue: any = '';
                let ruleMessage: string = '';

                if (isString(rule)) {
                    ruleName = rule;
                }
                else if (isObject(rule)) {
                    ruleName = rule[NAME];
                    ruleValue = rule[VALUE];
                    ruleMessage = rule[MESSAGE];
                }

                let ruleFn = rules[ruleName];
                if (!ruleFn) {
                    logWarn('Unknown rule: ' + ruleName);
                    continue;
                }

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
                        arrayAdd(errors[propName], messages[ruleName](propName, ruleValue, data) || propName + ' is invalid.');
                    }
                }
            }
        }

        return !countKeys(errors);
    }

    return {
        prop,
        rule,
        [VALIDATE]: validate,
        errors,
    };
}