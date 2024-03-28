import { slice } from ".";

export let arrayUnique = (array: any[]) =>
    [...new Set(array)];

export let arrayAdd = (array: any[], value: any) =>
    array.push(value);

export let arrayRemove = (array: any[], value: any) => {
    let index = array.indexOf(value);
    if (index === -1) return false;
    array.splice(index, 1);
    return true;
}

export let arrayFrom = (arrayLike: any) =>
    Array.from(arrayLike);

export let arrayFill = (length: number, value: any = null) =>
    arrayFrom({ length }).map((_, i) => value || i);

export let arrayMerge = (...arrays: any[][]) =>
    arrays.reduce((acc, array) => acc.concat(array), []);

export let arrayReverse = (array: any[]) =>
    slice(array).reverse();

export let each = (value: any[], callbackfn: (value: any, index: number, array: any[]) => void) =>
    value.forEach(callbackfn);