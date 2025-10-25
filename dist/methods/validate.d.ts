export declare let validator: (data: ObjectType) => {
    prop: (name: string, rules: SchemaRules) => void;
    rule: (name: string, fn: RuleFn, message?: MessageFn) => void;
    validate: () => boolean;
    errors: ObjectType;
};
