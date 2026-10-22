import { l as isString, g as getLength, j as isArray, e as isObjectType, f as isNumber, n as includesItem, o as objectEntries, c as createTypeError, p as objectKeys } from "./native-Ba4LWja7.js";
const defaultRules = {
  required: (val) => {
    if (val === null || val === void 0 || val === false || val === "") return false;
    if (isString(val)) return getLength(val.trim()) > 0;
    if (isArray(val)) return getLength(val) > 0;
    if (isObjectType(val)) return getLength(objectKeys(val)) > 0;
    return true;
  },
  min: (val, min) => {
    if (isString(val) || isArray(val)) return getLength(val) >= Number(min);
    if (isNumber(val)) return val >= Number(min);
    return false;
  },
  max: (val, max) => {
    if (isString(val) || isArray(val)) return getLength(val) <= Number(max);
    if (isNumber(val)) return val <= Number(max);
    return false;
  },
  email: (val) => {
    if (!isString(val)) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  },
  same: (val, targetProp, allData) => val === allData[String(targetProp)],
  in: (val, list) => isArray(list) && includesItem(list, val)
};
function validate(data, schema, customRules = {}) {
  const rules = { ...defaultRules, ...customRules };
  const errors = {};
  for (const [prop, propRules] of objectEntries(schema)) {
    const val = data[prop];
    for (const rule of propRules) {
      const ruleFn = rules[rule.name];
      if (!ruleFn)
        throw createTypeError(`Unknown validation rule "${rule.name}" for field "${prop}". Known rules: ${objectKeys(rules).join(", ")}.`);
      if (!ruleFn(val, rule.value, data)) {
        if (!errors[prop]) errors[prop] = [];
        errors[prop].push(rule.message || `${prop} failed ${rule.name} validation`);
      }
    }
  }
  return getLength(objectKeys(errors)) === 0 ? true : errors;
}
export {
  defaultRules,
  validate
};
//# sourceMappingURL=forms-entry.js.map
