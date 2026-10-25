import { maskDirective } from '../dom/directives/mask';
import { formDirective } from './form-plugin';
import type { BrioPluginObject } from '../core/types';

/** Official add-on: `b-mask` input formatting and `b-form` whole-form state as `$form`. */
export const inputsPlugin: BrioPluginObject = { name: 'brio-inputs', directives: [maskDirective, formDirective] };
