import type { ProductInput } from "./product";

export type ProductImportData = Partial<
    Record<keyof ProductInput, unknown>
>;

export interface ProductFileRow {
    rowNumber: number;
    data: ProductImportData;
}

export interface ProductImportResult {
    rowNumber: number;
    data: ProductInput;
    errors: string[];
    valid: boolean;
}

export interface ProductImportPreview {
    total: number;
    validCount: number;
    invalidCount: number;
    rows: ProductImportResult[];
}