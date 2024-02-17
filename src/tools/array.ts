export const arrayUnique = (array: any[]) => {
    return [...new Set(array)];
}

export const arrayAdd = (array: any[], value: any) => {
    if (inArray(array, value)) return false;
    array.push(value);
    return true;
}

export const arrayRemove = (array: any[], value: any) => {
    const index = array.indexOf(value);
    if (index === -1) return false;
    array.splice(index, 1);
    return true;
}

export const inArray = (array: any[], value: any) => {
    return new Set(array).has(value);
}

export const arrayFrom = (arrayLike: any) => {
    return Array.from(arrayLike);
}

export const arrayFill = (length: number, value: any = null) => {
    return arrayFrom({ length }).map((_, i) => value || i);
}