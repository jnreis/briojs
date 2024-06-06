import { $emit } from './dom';
import { $interceptor } from './hydration';
import { $persist, $session } from './reactivity';
import { $uid } from './tools';
import { $animate, $in, $out } from './transition';

import { $ANIMATE, $EMIT, $UID, $WATCH, AFTER, BEFORE } from '../tools/constants';
import { watch } from '../reactivity';

export let _methods: [string, MagicMethod][] = [
    [$EMIT, $emit],

    [$UID, $uid],

    [$WATCH, () => watch],
    ['$persist', $persist],
    ['$session', $session],

    ['$'+BEFORE, $interceptor(BEFORE)],
    ['$'+AFTER, $interceptor(AFTER)],

    ['$in', $in],
    ['$out', $out],
    [$ANIMATE, $animate]
];