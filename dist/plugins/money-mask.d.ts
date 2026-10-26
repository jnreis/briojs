import { MaskFormatter } from '../dom/directives/mask.js';
export type MoneyMaskOptions = {
    thousands?: string;
    decimal?: string;
    precision?: number;
};
export declare function moneyMask(options?: MoneyMaskOptions): MaskFormatter;
