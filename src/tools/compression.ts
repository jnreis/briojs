import { has } from ".";
// import { arrayAdd } from "./array";

let sequences: string[] = [];

/** 
 * Compress a string
 * requirements:
 * - the compress function will take an array of strings.
 * - each string will be analyzed and broken down into sequences of characters.
 * - a sequence is a string of characters containing the minimum number of characters that are not repeated in the string.
 */
export let compress = (strings: string[]) => {
    // let result = '';
    let startIndex = 0;
    // loop through the string
    for (let endIndex = 0; endIndex < str.length; endIndex++) {
        // Get the sequence of characters from the start index to the end index
        let sequence = str.slice(startIndex, endIndex + 1);

        // If the sequence is already in the sequences array, continue
        if (has(sequences, sequence)) continue;

        // Find the index of the last sequence
        // let lastSequenceIndex = sequences.indexOf(sequence.slice(0, -1));

        // Add the last sequence to the sequences array
        // let sequenceIndex = arrayAdd(sequences, lastSequence) - 1;

        // 


        // // Add the sequence to the sequences 
        // sequences[sequence] = sequences[lastSequence] + 1;

        // // Update the last sequence
        // lastSequence = sequence;

        // // Update the start index
        // startIndex = endIndex;

        // Add the compressed sequence to the result

    }
}

/** Decompress a string */
export let decompress = (str: string) => {
    let startIndex = 0;
    let result = '';

    // loop through the string
    for (let endIndex = 0; endIndex < str.length; endIndex++) {
        // Get the sequence of characters from the start index to the end index
        let sequence = str.slice(startIndex, endIndex + 1);

        // If the sequence is in the sequences object, continue
        // if (sequences[sequence]) continue;

        // Add the sequence to the result
        result += sequence;

        // Update the start index
        startIndex = endIndex;
    }

    return result;
}