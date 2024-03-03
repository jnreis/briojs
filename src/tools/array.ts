export let arrayUnique = (array: any[]) => {
    return [...new Set(array)];
}

export let arrayAdd = (array: any[], value: any) => {
    return array.push(value);
}

export let arrayRemove = (array: any[], value: any) => {
    let index = array.indexOf(value);
    if (index === -1) return false;
    array.splice(index, 1);
    return true;
}

export let inArray = (array: any[], value: any) => {
    return new Set(array).has(value);
}

export let arrayFrom = (arrayLike: any) => {
    return Array.from(arrayLike);
}

export let arrayFill = (length: number, value: any = null) => {
    return arrayFrom({ length }).map((_, i) => value || i);
}