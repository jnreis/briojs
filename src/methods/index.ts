import { $emit } from './dom';
import { $interceptor } from './hydration';
import { $watch, $persist, $session } from './reactivity';
import { $uid, $type } from './tools';
import { $in, $out } from './transition';
import { $http } from './http';

import { arrayAdd, each } from '../tools/array';
import { AFTER, BEFORE } from '../tools/constants';

export let _methods: [string, MagicMethod][] = [
    ['$'+BEFORE, $interceptor(BEFORE)],
    ['$'+AFTER, $interceptor(AFTER)],
];

each([$emit, $uid, $type, $http, $watch, $persist, $session, $in, $out], fn => {
    arrayAdd(_methods, [fn.name, fn]);
});