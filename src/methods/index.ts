import { MagicMethod } from '..';

import { $emit } from './emit';
import { $uid } from './uid';
import { $watch } from './watch';
import { $persist, $session } from './storage';

import { $EMIT, $UID, $WATCH } from '../tools/constants';

export let _methods: [string, MagicMethod][] = [
    [$EMIT, $emit],
    [$UID, $uid],
    [$WATCH, $watch],
    ['$persist', $persist],
    ['$session', $session],
];