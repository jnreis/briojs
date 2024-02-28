import { isArray } from './typeCheck';

export let toNumber = (value: any) => {
    let n = Number(value);
    return isNaN(n) || isArray(value) ? value : n;
}