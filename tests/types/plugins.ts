import { moneyMask } from 'briojs/money-mask';
import type { MoneyMaskOptions, MaskContext, MaskResult, MaskFormatter } from 'briojs/money-mask';
import { http, HttpError } from 'briojs/http';
import type { HttpOptions } from 'briojs/http';
import { validate } from 'briojs/forms';
import type { ValidationSchema } from 'briojs/forms';
import { createStepEngine } from 'briojs/step';
import type { StepEngine } from 'briojs/step';
import type { MaskFormatter as CoreFormatter } from 'briojs';

const formatter: MaskFormatter = ({ value, inputType, selectionStart }: MaskContext): MaskResult => {
    const type: string | undefined = inputType;
    void type;
    return { value: value.toUpperCase(), selectionStart: selectionStart ?? undefined };
};
const options: MoneyMaskOptions = { precision: 3 };
const money: CoreFormatter = moneyMask(options);
const schema: ValidationSchema = { name: [{ name: 'required' }] };
validate({ name: 'Ada' }, schema);
const httpOptions: HttpOptions = { parser: 'text' };
const request: Promise<unknown> = http.get('/demo', undefined, httpOptions);
const error: HttpError = new HttpError(new Response(null, { status: 400 }));
const step: StepEngine = createStepEngine({ initial: 'intro', steps: { intro: {} } });
// @ts-expect-error Formatter must return a string or a properly shaped result.
const bad: MaskFormatter = () => 123;
// @ts-expect-error Formatter must be synchronous.
const asyncMask: MaskFormatter = async ({ value }) => value;
// @ts-expect-error Precision must be numeric.
moneyMask({ precision: '2' });
void [formatter, money, request, error, step, bad, asyncMask];
