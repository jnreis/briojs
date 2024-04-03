// Name of the primitive types
export let NUMBER = 'number';
export let STRING = 'string';
export let BOOLEAN = 'boolean';
export let UNDEFINED = 'undefined';
export let NULL = 'null';
export let SYMBOL = 'symbol';
export let BIGINT = 'bigint';

// Name of the objects
export let OBJECT = 'object';
export let ARRAY = 'array';
export let MAP = 'map';
export let SET = 'set';
export let WEAKMAP = 'weakmap';
export let WEAKSET = 'weakset';

// Name of the function types
export let METHOD = 'method';
export let FUNCTION = 'function';
export let ASYNC_FUNCTION = 'asyncfunction';
export let PROMISE = 'promise';
export let REGEXP = 'regexp';
export let DATE = 'date';
export let ERROR = 'error';

// HTML input types
export let INPUT = 'input';
export let TEXTAREA = 'textarea';
export let SELECT = 'select';
export let CHECKBOX = 'checkbox';
export let RADIO = 'radio';
export let VALUE = 'value';
export let CHANGE = 'change';
export let CHECKED = 'checked';
export let COMPOSING = 'composing';
export let SELECTION_START = 'selectionStart';
export let ELEMENT = 'element';

// Brio attributes
export let PROPS: 'props' = 'props';
export let TEXT: 'text' = 'text';
export let EACH: 'each' = 'each';
export let PREFIX: 'prefix' = 'prefix';

// HTML attributes
export let STYLE: 'style' = 'style';
export let CLASS = 'class';
export let GET_COMPUTED_STYLE: 'getComputedStyle' = 'getComputedStyle';
export let DISPLAY: 'display' = 'display';
export let OPACITY: 'opacity' = 'opacity';
export let TEXT_CONTENT = TEXT + 'Content' as 'textContent';

// Brio magic properties/methods
export let $STORE: '$store' = '$store';
export let $PROPS: '$props' = '$props';
export let $EL: '$el' = '$el';
export let $REFS: '$refs' = '$refs';
export let $ROOT: '$root' = '$root';
export let $EMIT: '$emit' = '$emit';
export let $UID: '$uid' = '$uid';
export let $WATCH: '$watch' = '$watch';

// Miscellaneous
export let ATTR: 'attr' = 'attr';
export let EFFECT: 'effect' = 'effect';
export let DIRECTIVE: 'directive' = 'directive';
export let ATTRIBUTE = ATTR + 'ibute' as 'attribute';
export let REQUIRE: 'require' = 'require';
export let EXPRESSION: 'expression' = 'expression';
export let TELEPORT: 'teleport' = 'teleport';
export let THRESHOLD: 'threshold' = 'threshold';
export let OPTION: 'option' = 'option';
export let INIT: 'init' = 'init';

// Operation types
export let CREATE = 'create';
export let UPDATE = 'update';
export let DELETE: 'delete' = 'delete';

// Error messages
export let MUST_BE = 'must be';
export let BEFORE_INIT = MUST_BE + ' defined before initialization.';
export let CAN_ONLY_BE_USED_ON = 'can only be used on';