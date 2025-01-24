export const cssSaves = (css: string) => {
    let words: ObjectType = {}
    css.match(/\w+/g)?.forEach(w => {
        if (w in words) words[w] = words[w] + 1;
        else words[w] = 1;
    });
    let saved: ObjectType = {};
    for (let w in words) {
        // (chars count * ref count) - (ref count * 3) - 15 = how many chars will be saved
        let saves = (w.length * words[w]) - (words[w] * 3) - 15;
        if (saves > 0) saved[w] = saves;
    }
    return Object.values(saved).reduce((saves, value) => saves + value, 0);
}