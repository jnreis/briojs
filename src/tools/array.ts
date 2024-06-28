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

export let splice = (array: any[], start: number, deleteCount: number, ...items: any[]) =>
    array.splice(start, deleteCount, ...items);

export let arrayFrom = (arrayLike: any) =>
    Array.from(arrayLike);

export let arrayFill = (length: number, startAt: number = 0) =>
    arrayFrom({ length }).map((_, i) => startAt + i);

export let arrayMerge = (...arrays: any[][]) =>
    arrays.reduce((acc, array) => acc.concat(array), []);

export let arrayReverse = (array: any[]) =>
    slice(array).reverse();

export let each = (value: any, callbackfn: (value: any, index: number, array: any) => void) =>
    value.forEach(callbackfn);

export let join = (array: any[], separator: string = ',') =>
    array.join(separator);