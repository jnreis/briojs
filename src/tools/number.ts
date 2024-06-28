import { isNumeric } from './typeCheck';

export let toNumber = (value: any) => {
    return isNumeric(value) ? Number(value) : value;
}