import { $emit } from './dom';
import { $lifecycle } from './hydration';
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

    ['$'+BEFORE, $lifecycle(BEFORE)],
    ['$'+AFTER, $lifecycle(AFTER)],

    ['$in', $in],
    ['$out', $out],
];