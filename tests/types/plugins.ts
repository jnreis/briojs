import { moneyMask, validate, inputsPlugin } from '@jnreis/briojs/inputs';
import type { MoneyMaskOptions, MaskContext, MaskResult, MaskFormatter, ValidationSchema } from '@jnreis/briojs/inputs';
import { observersPlugin } from '@jnreis/briojs/observers';
import { http, HttpError } from '@jnreis/briojs/http';
import type { HttpOptions } from '@jnreis/briojs/http';
import { createStepEngine } from '@jnreis/briojs/step';
import type { StepEngine } from '@jnreis/briojs/step';
import type { MaskFormatter as CoreFormatter } from '@jnreis/briojs';
import { createApp } from '@jnreis/briojs';
import type { UnmountOptions } from '@jnreis/briojs';
import { createRouter } from '@jnreis/briojs/router';
import type { RouterOptions } from '@jnreis/briojs';

const routerOptions: RouterOptions = { base: '/my-app/' };
const router = createRouter([{ path: '/', component: 'home-page' }], routerOptions);
const link: string = router.href('/?sort=name#details');
const base: string = router.base;
// @ts-expect-error Base must be a pathname string.
createRouter([], { base: 123 });
void [link, base];

const teardown: UnmountOptions = { restore: false };
const app = createApp({ plugins: [inputsPlugin, observersPlugin] });
app.use(inputsPlugin);
const mount = app.mount(document.createElement('main'));
mount.unmount(teardown);
app.unmount(teardown);
app.dispose(teardown);
// @ts-expect-error Restore must be a boolean.
app.unmount({ restore: 'false' });

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
