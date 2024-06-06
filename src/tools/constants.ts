// Name of the primitive types
export let NUMBER: 'number' = 'number';
export let STRING: 'string' = 'string';
export let BOOLEAN: 'boolean' = 'boolean';
export let UNDEFINED: 'undefined' = 'undefined';
export let NULL: 'null' = 'null';
export let SYMBOL: 'symbol' = 'symbol';
export let BIGINT: 'bigint' = 'bigint';

// Name of the objects types
export let OBJECT: 'object' = 'object';
export let ARRAY: 'array' = 'array';
export let MAP: 'map' = 'map';
export let SET: 'set' = 'set';
export let WEAKMAP: 'weakmap' = 'weakmap';
export let WEAKSET: 'weakset' = 'weakset';

// Name of the function types
export let METHOD: 'method' = 'method';
export let FUNCTION: 'function' = 'function';
export let ASYNC_FUNCTION: 'asyncfunction' = 'asyncfunction';
export let PROMISE: 'promise' = 'promise';
export let REGEXP: 'regexp' = 'regexp';
export let DATE: 'date' = 'date';
export let ERROR: 'error' = 'error';

// HTML input types
export let INPUT: 'input' = 'input';
export let TEXTAREA: 'textarea' = 'textarea';
export let SELECT: 'select' = 'select';
export let CHECKBOX: 'checkbox' = 'checkbox';
export let RADIO: 'radio' = 'radio';
export let VALUE: 'value' = 'value';
export let CHANGE: 'change' = 'change';
export let CHECKED: 'checked' = 'checked';
export let COMPOSING: 'composing' = 'composing';
export let SELECTION_START: 'selectionStart' = 'selectionStart';
export let ELEMENT: 'element' = 'element';

// Brio attributes
export let PROPS: 'props' = 'props';
export let TEXT: 'text' = 'text';
export let EACH: 'each' = 'each';
export let PREFIX: 'prefix' = 'prefix';

// HTML attributes
export let STYLE: 'style' = 'style';
export let CLASS: 'class' = 'class';
export let GET_COMPUTED_STYLE: 'getComputedStyle' = 'getComputedStyle';
export let DISPLAY: 'display' = 'display';
export let OPACITY: 'opacity' = 'opacity';
export let TEXT_CONTENT = TEXT + 'Content' as 'textContent';

// Brio magic properties/methods
export let $STORE: '$store' = '$store';
export let $PROPS: '$props' = '$props';
export let $REFS: '$refs' = '$refs';
export let $ROOT: '$root' = '$root';
export let $EMIT: '$emit' = '$emit';
export let $UID: '$uid' = '$uid';
export let $WATCH: '$watch' = '$watch';

// Miscellaneous
export let ATTR: 'attr' = 'attr';
export let CLEANUP: 'cleanup' = 'cleanup';
export let COMPONENT: 'component' = 'component';
export let DIRECTIVE: 'directive' = 'directive';
export let ATTRIBUTE = ATTR + 'ibute' as 'attribute';
export let REQUIRE: 'require' = 'require';
export let EXPRESSION: 'expression' = 'expression';
export let TELEPORT: 'teleport' = 'teleport';
export let THRESHOLD: 'threshold' = 'threshold';
export let OPTION: 'option' = 'option';
export let INIT: 'init' = 'init';
export let STATUS: 'status' = 'status';
export let SKIP: 'skip' = 'skip';
export let BEFORE: 'before' = 'before';
export let AFTER: 'after' = 'after';

// Operation types
export let CREATE: 'create' = 'create';
export let UPDATE: 'update' = 'update';
export let DELETE: 'delete' = 'delete';

// Animation & transition
export let TRANSITION: 'transition' = 'transition';
export let TRANSITION_ENGINE = TRANSITION + ' engine';
export let PAUSE = 'pause';
export let PLAY: 'play' = 'play';
export let REVERSE: 'reverse' = 'reverse';
export let REVERSED = REVERSE+'d';
export let CURRENT_TIME = 'currentTime';
export let DURATION = 'duration';
export let EVENT_CALLBACK = 'eventCallback';
export let COMPLETE = 'complete';
export let ON_COMPLETE: 'onComplete' = 'onComplete';
export let PLAYBACK_RATE = 'playbackRate';
export let NAME: 'name' = 'name';
export let VALIDATE: 'validate' = 'validate';

// Error messages
export let MUST_BE = 'must be';
export let BEFORE_INIT = MUST_BE + ` defined ${BEFORE} initialization.` as 'must be defined before initialization';
export let CAN_ONLY_BE_USED_ON = 'can only be used on';
export let NOT_FOUND = 'not found.';
export let INVALID: 'Invalid' = 'Invalid';

export let BUT_GOT_INSTEAD = (somethingElse: string) => `but got ${somethingElse} instead.`;
export let API_ADD_ERROR = (apiModule: string, moduleName: string) => `The ${apiModule} "${moduleName}" ${BEFORE_INIT}`;