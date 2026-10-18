throw new Error('Deliberate fixture module failure');

export default function createBroken() {
    throw new Error('Broken module factory must never run');
}
