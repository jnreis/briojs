import { h as isInstanceOf, c as createTypeError, j as isString, i as isFunction, g as getLength, m as createSyntaxError, e as isObjectType, R as ReflectApi, f as isNumber, k as isArray, n as includesItem, o as objectEntries, p as objectKeys, a as arrayFrom, s as startsWith } from "./native-C6Z9zuZA.js";
import { d as getOwnerDocument } from "./native-D9adRJpp.js";
import { s as state } from "./state-D6RTXn8X.js";
function compilePattern(pattern) {
  const parts = [];
  const characters = [...pattern];
  for (let index = 0; index < getLength(characters); index++) {
    const character = characters[index];
    if (character === "\\") {
      if (++index === getLength(characters)) throw createSyntaxError("Mask pattern cannot end with an escape.");
      parts.push({ literal: characters[index] });
    } else if (character === "*") parts.push({ accepts: () => true });
    else if (character === "A") parts.push({ accepts: (value) => /[\p{L}\p{Nd}]/u.test(value) });
    else if (character === "a") parts.push({ accepts: (value) => new RegExp("\\p{L}", "u").test(value) });
    else if (character === "#") parts.push({ accepts: (value) => new RegExp("\\p{Nd}", "u").test(value) });
    else parts.push({ literal: character });
  }
  return parts;
}
function patternFormatter(pattern) {
  const parts = compilePattern(pattern);
  return (context) => {
    const input = [...context.value];
    const positions = [];
    let value = "";
    let index = 0;
    let offset = 0;
    for (const part of parts) {
      if (index >= getLength(input)) break;
      if ("literal" in part) {
        value += part.literal;
        if (input[index] === part.literal) {
          offset += getLength(input[index++]);
        }
      } else {
        while (index < getLength(input) && !part.accepts(input[index]))
          offset += getLength(input[index++]);
        if (index < getLength(input)) {
          const character = input[index++];
          value += character;
          offset += getLength(character);
          positions.push({ input: offset, output: getLength(value) });
        }
      }
    }
    const map = (position) => {
      var _a;
      if (position === null) return void 0;
      return ((_a = positions.filter((entry) => entry.input <= position).at(-1)) == null ? void 0 : _a.output) ?? 0;
    };
    return { value, selectionStart: map(context.selectionStart), selectionEnd: map(context.selectionEnd) };
  };
}
function validateResult(result) {
  if (isString(result)) return;
  if (result === null || !isObjectType(result) || !("value" in result) || !isString(result.value))
    throw createTypeError("Mask formatter must return a string or { value, selectionStart?, selectionEnd? }.");
  for (const key of ["selectionStart", "selectionEnd"]) {
    const position = key in result ? ReflectApi.get(result, key) : void 0;
    if (position !== void 0 && (!isNumber(position) || !Number.isInteger(position) || position < 0 || position > getLength(result.value)))
      throw createTypeError(`Mask formatter ${key} must be an integer within the formatted value.`);
  }
}
const maskDirective = {
  name: "b-mask",
  modifiers: [],
  mount(element, binding) {
    if (!(isInstanceOf(element, HTMLInputElement) || isInstanceOf(element, HTMLTextAreaElement)))
      throw createTypeError("b-mask can only be used on input and textarea elements.");
    let formatter;
    let applying = false;
    let composing = false;
    const applyMask = (event) => {
      if (applying || composing || isInstanceOf(event, InputEvent) && event.isComposing) return;
      const current = element.value;
      const start = element.selectionStart;
      const end = element.selectionEnd;
      const direction = element.selectionDirection;
      const result = formatter({
        value: current,
        selectionStart: start,
        selectionEnd: end,
        selectionDirection: direction,
        inputType: isInstanceOf(event, InputEvent) ? event.inputType : void 0
      });
      validateResult(result);
      const value = isString(result) ? result : result.value;
      const clamp = (position) => Math.min(position, getLength(value));
      const mappedStart = isString(result) ? start : result.selectionStart ?? start;
      const mappedEnd = isString(result) ? end : result.selectionEnd ?? end;
      applying = true;
      try {
        if (current !== value) {
          element.value = value;
          element.dispatchEvent(new Event("input", { bubbles: true }));
        }
        if (getOwnerDocument(element).activeElement === element && mappedStart !== null && mappedEnd !== null)
          element.setSelectionRange(clamp(mappedStart), clamp(mappedEnd), direction ?? "none");
      } finally {
        applying = false;
      }
    };
    binding.on(element, "input", applyMask, true);
    binding.on(element, "compositionstart", () => {
      composing = true;
    });
    binding.on(element, "compositionend", () => {
      composing = false;
      applyMask();
    });
    binding.effect(() => {
      const value = binding.value();
      if (isString(value)) formatter = patternFormatter(value);
      else if (isFunction(value)) formatter = value;
      else throw createTypeError("b-mask must evaluate to a pattern string or formatter function.");
      applyMask();
    });
  }
};
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
const skippedTypes = ["submit", "button", "reset", "image"];
const controls = (form) => arrayFrom(form.elements).filter((control) => control.name && !includesItem(skippedTypes, control.type));
function readForm(form) {
  const values = {};
  const all = controls(form);
  for (const control of all) {
    const { name, type } = control;
    if (type === "checkbox") {
      const input = control;
      if (getLength(all.filter((other) => other.name === name && other.type === "checkbox")) > 1)
        values[name] = [...values[name] ?? [], ...input.checked ? [input.value] : []];
      else values[name] = input.checked;
    } else if (type === "radio") {
      if (control.checked) values[name] = control.value;
      else if (!(name in values)) values[name] = "";
    } else if (type === "select-multiple") {
      values[name] = arrayFrom(control.selectedOptions, (option) => option.value);
    } else if (type === "number" || type === "range") {
      values[name] = control.value === "" ? null : Number(control.value);
    } else if (type === "file") {
      values[name] = arrayFrom(control.files ?? []);
    } else {
      values[name] = control.value;
    }
  }
  return values;
}
function mountForm(element, binding, form) {
  const formElement = element;
  const options = () => (binding.expression.trim() ? binding.value() : void 0) ?? {};
  const check = () => {
    const { rules = {}, customRules } = options();
    const result = validate(form.values, rules, customRules);
    form.errors = result === true ? {} : result;
    form.valid = result === true;
  };
  const refresh = () => {
    form.values = readForm(formElement);
  };
  form.reset = () => formElement.reset();
  form.submit = () => formElement.requestSubmit();
  refresh();
  binding.effect(check);
  binding.effect(() => {
    for (const control of controls(formElement)) {
      if (form.error(control.name)) control.setAttribute("aria-invalid", "true");
      else control.removeAttribute("aria-invalid");
    }
  });
  binding.on(formElement, "input", refresh);
  binding.on(formElement, "change", refresh);
  binding.on(formElement, "focusout", (event) => {
    const name = event.target.name;
    if (name && !form.touched[name]) form.touched = { ...form.touched, [name]: true };
  });
  binding.on(formElement, "reset", () => queueMicrotask(() => {
    refresh();
    form.touched = {};
    form.submitted = false;
    form.submitError = null;
  }));
  binding.on(formElement, "submit", async (event) => {
    var _a;
    const submitEvent = event;
    refresh();
    check();
    form.submitted = true;
    if (form.submitting || !form.valid) {
      submitEvent.preventDefault();
      if (!form.valid) (_a = controls(formElement).find((control) => form.errors[control.name])) == null ? void 0 : _a.focus();
      return;
    }
    const { submit } = options();
    if (!isFunction(submit)) return;
    submitEvent.preventDefault();
    form.submitting = true;
    form.submitError = null;
    try {
      await submit(form.values, submitEvent);
    } catch (error) {
      form.submitError = error;
    } finally {
      form.submitting = false;
    }
  });
}
const forms = /* @__PURE__ */ new WeakMap();
const formDirective = {
  name: "b-form",
  modifiers: [],
  description: "Tracks the values, validation errors, touched fields, and submission state of a <form> as $form.",
  example: '<form b-form="{ rules, submit: save }">',
  scope(element) {
    if (element.localName !== "form")
      throw createTypeError(`b-form only works on a <form> element, not <${element.localName}>.`);
    const form = state({
      values: {},
      errors: {},
      touched: {},
      valid: true,
      submitting: false,
      submitted: false,
      submitError: null,
      error: (name) => {
        var _a;
        return (form.touched[name] || form.submitted) && ((_a = form.errors[name]) == null ? void 0 : _a[0]) || "";
      },
      reset() {
      },
      submit() {
      }
    });
    forms.set(element, form);
    return { $form: form };
  },
  ready(element, binding) {
    mountForm(element, binding, forms.get(element));
    forms.delete(element);
  }
};
const inputsPlugin = { name: "brio-inputs", directives: [maskDirective, formDirective] };
function moneyMask(options = {}) {
  if (options === null || !isObjectType(options) || isArray(options))
    throw createTypeError("Money mask options must be an object.");
  const { thousands = ",", decimal = ".", precision = 2 } = options;
  if (!isString(thousands)) throw createTypeError("Money mask thousands must be a string.");
  if (!isString(decimal) || !decimal) throw createTypeError("Money mask decimal must be a non-empty string.");
  if (!Number.isInteger(precision) || precision < 0 || precision > 100)
    throw new RangeError("Money mask precision must be an integer between 0 and 100.");
  if (thousands === decimal) throw createTypeError("Money mask thousands and decimal separators must differ.");
  return ({ value, selectionStart, selectionEnd }) => {
    const digits = value.replace(/\D/g, "");
    const negative = startsWith(value.trim(), "-");
    const integer = precision ? digits.slice(0, -precision) || "0" : digits;
    const fraction = precision ? digits.slice(-precision).padStart(precision, "0") : "";
    const grouped = (integer.replace(/^0+/, "") || "0").replace(/\B(?=(\d{3})+(?!\d))/g, () => thousands);
    const formatted = digits ? `${negative ? "-" : ""}${grouped}${fraction ? decimal + fraction : ""}` : "";
    const map = (position) => {
      if (position === null) return void 0;
      if (position === 0) return 0;
      const rightDigits = getLength(value.slice(position).replace(/\D/g, ""));
      const offsets = [];
      let offset = negative ? 1 : 0;
      const plainInteger = integer.replace(/^0+/, "") || "0";
      for (let index = 0; index < getLength(plainInteger); index++) {
        if (index && (getLength(plainInteger) - index) % 3 === 0) offset += getLength(thousands);
        offsets.push(++offset);
      }
      if (fraction) {
        offset += getLength(decimal);
        for (let index = 0; index < getLength(fraction); index++) offsets.push(++offset);
      }
      return formatted ? offsets[Math.max(0, getLength(offsets) - rightDigits) - 1] ?? (negative ? 1 : 0) : 0;
    };
    return { value: formatted, selectionStart: map(selectionStart), selectionEnd: map(selectionEnd) };
  };
}
export {
  defaultRules,
  inputsPlugin,
  moneyMask,
  readForm,
  validate
};
//# sourceMappingURL=inputs-entry.js.map
