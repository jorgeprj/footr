import {
    validateProduct,
    type ProductInput,
    type ProductValidationErrors,
} from "../domain/product";

import type {
    ProductFileRow,
    ProductImportResult,
} from "../domain/product-import";

function normalizeString(value: unknown): string {
    return typeof value === "string" || typeof value === "number"
        ? String(value).trim()
        : "";
}

function normalizeProductInput(row: ProductFileRow): ProductInput {
    const data = row.data;

    return {
        teamName: normalizeString(data.teamName),
        season: normalizeString(data.season),
        type: normalizeString(data.type),
        version: normalizeString(data.version),
        size: normalizeString(data.size),
        costPrice:
            typeof data.costPrice === "number"
                ? data.costPrice
                : Number.NaN,
        salePrice:
            typeof data.salePrice === "number"
                ? data.salePrice
                : Number.NaN,
    };
}

function getValidationMessages(
    errors: ProductValidationErrors,
): string[] {
    return Object.values(errors);
}

export function validateProductImport(
    rows: ProductFileRow[],
): ProductImportResult[] {
    return rows.map((row) => {
        const input = normalizeProductInput(row);
        const validationErrors = validateProduct(input);
        const errors = getValidationMessages(validationErrors);

        return {
            rowNumber: row.rowNumber,
            data: input,
            errors,
            valid: errors.length === 0,
        };
    });
}