import { $emit } from './dom';
import { $interceptor } from './hydration';
import { $watch, $persist, $session } from './reactivity';
import { $uid } from './tools';
import { $in, $out } from './transition';

import { $EMIT, $UID, $WATCH, AFTER, BEFORE } from '../tools/constants';

export let _methods: [string, MagicMethod][] = [
    [$EMIT, $emit],

    [$UID, $uid],

    [$WATCH, $watch],
    ['$persist', $persist],
    ['$session', $session],

    ['$'+BEFORE, $interceptor(BEFORE)],
    ['$'+AFTER, $interceptor(AFTER)],

    ['$in', $in],
    ['$out', $out],
];