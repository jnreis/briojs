import { MaskFormatter } from '../dom/directives/mask';

export type MoneyMaskOptions = {
    thousands?: string;
    decimal?: string;
    precision?: number;
};
export declare function moneyMask(options?: MoneyMaskOptions): MaskFormatter;
