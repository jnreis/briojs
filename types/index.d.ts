declare module "briojs" {
    export function newApp(node?: Node | string, ctxNode?: Node | string): GlobalContext;
    export function newFn(fn: FunctionType, returnsFn?: boolean, keyLength?: number): string;
}
