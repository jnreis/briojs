const defaultRules = {
  required: (val) => {
    if (val === null || val === void 0 || val === false || val === "") return false;
    if (typeof val === "string") return val.trim().length > 0;
    if (Array.isArray(val)) return val.length > 0;
    if (typeof val === "object") return Object.keys(val).length > 0;
    return true;
  },
  min: (val, min) => {
    if (typeof val === "string" || Array.isArray(val)) return val.length >= Number(min);
    if (typeof val === "number") return val >= Number(min);
    return false;
  },
  max: (val, max) => {
    if (typeof val === "string" || Array.isArray(val)) return val.length <= Number(max);
    if (typeof val === "number") return val <= Number(max);
    return false;
  },
  email: (val) => {
    if (typeof val !== "string") return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  },
  same: (val, targetProp, allData) => val === allData[String(targetProp)],
  in: (val, list) => Array.isArray(list) && list.includes(val)
};
function validate(data, schema, customRules = {}) {
  const rules = { ...defaultRules, ...customRules };
  const errors = {};
  for (const [prop, propRules] of Object.entries(schema)) {
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
  return Object.keys(errors).length === 0 ? true : errors;
}
export {
  defaultRules,
  validate
};
//# sourceMappingURL=forms-entry.js.map
