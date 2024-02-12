export function arrayUnique(array: any[]) {
    return [...new Set(array)];
}

export function arrayAdd(array: any[], value: any) {
    if (inArray(array, value)) return false;
    array.push(value);
    return true;
}

export function arrayRemove(array: any[], value: any) {
    const index = array.indexOf(value);
    if (index === -1) return false;
    array.splice(index, 1);
    return true;
}

export function inArray(array: any[], value: any) {
    return new Set(array).has(value);
}

export function arrayFrom(arrayLike: any){
    return Array.from(arrayLike);
}

export function arrayFill(length: number, value: any = null) {
    return arrayFrom({ length }).map((_, i) => value || i);
}