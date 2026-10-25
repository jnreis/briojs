import { createTypeError, getLength, isFunction, arrayFrom, includesItem } from '../core/native';
import { state } from '../reactivity/state';
import type { DirectiveBinding, DirectiveDefinition } from '../dom/directives/registry';
import { validate } from './forms';
import type { ValidationRule, ValidationSchema } from './forms';

export type FormOptions = {
    rules?: ValidationSchema;
    customRules?: Record<string, ValidationRule>;
    /** Called with the values when a valid form submits. The native submission is prevented while it runs. */
    submit?(values: Record<string, unknown>, event: SubmitEvent): unknown;
};

export type FormState = {
    values: Record<string, unknown>;
    errors: Record<string, string[]>;
    touched: Record<string, boolean>;
    valid: boolean;
    submitting: boolean;
    submitted: boolean;
    submitError: unknown;
    /** The first message for a field once it was touched or the form was submitted; otherwise an empty string. */
    error(name: string): string;
    reset(): void;
    submit(): void;
};

type Control = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

const skippedTypes = ['submit', 'button', 'reset', 'image'];

const controls = (form: HTMLFormElement): Control[] =>
    (arrayFrom(form.elements) as Control[]).filter(control => control.name && !includesItem(skippedTypes, control.type));

/** Reads named controls the way a server would see them, with checkboxes, numbers, and multi-selects typed. */
export function readForm(form: HTMLFormElement): Record<string, unknown> {
    const values: Record<string, unknown> = {};
    const all = controls(form);
    for (const control of all) {
        const { name, type } = control;
        if (type === 'checkbox') {
            const input = control as HTMLInputElement;
            if (getLength(all.filter(other => other.name === name && other.type === 'checkbox')) > 1)
                values[name] = [...(values[name] as string[] ?? []), ...(input.checked ? [input.value] : [])];
            else values[name] = input.checked;
        } else if (type === 'radio') {
            if ((control as HTMLInputElement).checked) values[name] = control.value;
            else if (!(name in values)) values[name] = '';
        } else if (type === 'select-multiple') {
            values[name] = arrayFrom((control as HTMLSelectElement).selectedOptions, option => option.value);
        } else if (type === 'number' || type === 'range') {
            values[name] = control.value === '' ? null : Number(control.value);
        } else if (type === 'file') {
            values[name] = arrayFrom((control as HTMLInputElement).files ?? []);
        } else {
            values[name] = control.value;
        }
    }
    return values;
}

function mountForm(element: Element, binding: DirectiveBinding<FormOptions>, form: FormState) {
    const formElement = element as HTMLFormElement;
    const options = (): FormOptions => (binding.expression.trim() ? binding.value() : undefined) ?? {};
    const check = () => {
        const { rules = {}, customRules } = options();
        const result = validate(form.values, rules, customRules);
        form.errors = result === true ? {} : result;
        form.valid = result === true;
    };
    const refresh = () => { form.values = readForm(formElement); };

    form.reset = () => formElement.reset();
    form.submit = () => formElement.requestSubmit();
    refresh();
    binding.effect(check);
    binding.effect(() => {
        for (const control of controls(formElement)) {
            if (form.error(control.name)) control.setAttribute('aria-invalid', 'true');
            else control.removeAttribute('aria-invalid');
        }
    });

    binding.on(formElement, 'input', refresh);
    binding.on(formElement, 'change', refresh);
    binding.on(formElement, 'focusout', event => {
        const name = (event.target as Control).name;
        if (name && !form.touched[name]) form.touched = { ...form.touched, [name]: true };
    });
    // The reset event fires before the controls are restored, so read them on the next microtask.
    binding.on(formElement, 'reset', () => queueMicrotask(() => {
        refresh();
        form.touched = {};
        form.submitted = false;
        form.submitError = null;
    }));
    binding.on(formElement, 'submit', async event => {
        const submitEvent = event as SubmitEvent;
        refresh();
        check();
        form.submitted = true;
        if (form.submitting || !form.valid) {
            submitEvent.preventDefault();
            if (!form.valid) controls(formElement).find(control => form.errors[control.name])?.focus();
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

const forms = new WeakMap<Element, FormState>();

export const formDirective: DirectiveDefinition = {
    name: 'b-form',
    modifiers: [],
    description: 'Tracks the values, validation errors, touched fields, and submission state of a <form> as $form.',
    example: '<form b-form="{ rules, submit: save }">',
    scope(element) {
        if (element.localName !== 'form')
            throw createTypeError(`b-form only works on a <form> element, not <${element.localName}>.`);
        const form: FormState = state<FormState>({
            values: {},
            errors: {},
            touched: {},
            valid: true,
            submitting: false,
            submitted: false,
            submitError: null,
            error: (name: string): string => (form.touched[name] || form.submitted) && form.errors[name]?.[0] || '',
            reset() {},
            submit() {},
        });
        forms.set(element, form);
        return { $form: form };
    },
    ready(element, binding) {
        mountForm(element, binding, forms.get(element)!);
        forms.delete(element);
    },
};

