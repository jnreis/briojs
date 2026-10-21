import { m as isString, g as getLength, k as isArray, f as isObjectType, h as isNumber, p as includesItem, e as objectEntries, q as objectKeys } from "./native-CjaBWh7p.js";
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
      if (ruleFn) {
        const passed = ruleFn(val, rule.value, data);
        if (!passed) {
          if (!errors[prop]) errors[prop] = [];
          errors[prop].push(rule.message || `${prop} failed ${rule.name} validation`);
        }
      } else {
        console.warn(`Unknown validation rule: ${rule.name}`);
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
