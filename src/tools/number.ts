import { isArray } from './typeCheck';

export function toNumber(value: any) {
    const n = Number(value);
    return isNaN(n) || isArray(value) ? value : n;
}