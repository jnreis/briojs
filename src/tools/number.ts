import { isNumeric } from './typeCheck';

export let INFINITY = Infinity;

export let M = Math;

export let toNumber = (value: any) =>
    isNumeric(value) ? Number(value) : value;

export let absoluteNumber = (value: number) =>
    M.abs(value);