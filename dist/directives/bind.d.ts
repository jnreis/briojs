/**
 * Bind Directive
 *
 * This directive binds a DOM element's attribute to a reactive property or method.
 *
 * Note: it will always set the DOM property for these attributes: "value", "checked", "selected", and "src".
 *
 * @option `prop`   Also set a specific DOM property.
 */
export declare let hydrateBind: (bnode: BNode, dirName: string, dirValue: string) => void;
export declare let bindDirective: Directive;
