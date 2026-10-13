export interface MoneyMaskOptions {
    thousands?: string;
    decimal?: string;
    precision?: number;
}
export declare function formatMoney(value: string, options?: MoneyMaskOptions): string;
export declare function formatMask(value: string, pattern: string): string;
export declare function handleMask(element: Element, expression: string, modifiers: Record<string, boolean>, _context: Record<PropertyKey, any>): void;
