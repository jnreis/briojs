import { isNumeric } from './typeCheck';

export let INFINITY = Infinity;

export let toNumber = (value: any) => {
    return isNumeric(value) ? Number(value) : value;
}