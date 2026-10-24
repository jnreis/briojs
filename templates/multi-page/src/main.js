import { mountWidgets } from './mount.js';
import { newsletter } from './widgets/newsletter.js';
import { pricing } from './widgets/pricing.js';

// One registry for the whole site; each page mounts only what it contains.
mountWidgets({ newsletter, pricing });
