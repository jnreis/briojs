import { isArray } from './typeCheck';

export const toNumber = (value: any) => {
    const n = Number(value);
    return isNaN(n) || isArray(value) ? value : n;
}