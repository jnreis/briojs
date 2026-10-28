import { ExpressionEngine } from './expression.js';
/** Compiles expressions to native functions with `new Function`. Needs CSP `script-src 'unsafe-eval'`. */
export declare const functionEngine: ExpressionEngine;
