import { createApp } from '@jnreis/briojs';
import type { AstroAppFactory } from '@jnreis/briojs/astro';

const createCounter: AstroAppFactory = (_root, props) => {
  const initial = props.initial ?? 0;
  if (typeof initial !== 'number' || !Number.isFinite(initial))
    throw new TypeError('Counter initial must be a finite number.');
  return createApp({ state: () => ({ count: initial }) });
};

export default createCounter;
