import { isNumeric } from './typeCheck';

export let INFINITY = Infinity;

export let toNumber = (value: any) => {
    return isNumeric(value) ? Number(value) : value;
}

export let absoluteNumber = (value: number) => {
    return Math.abs(value);
}