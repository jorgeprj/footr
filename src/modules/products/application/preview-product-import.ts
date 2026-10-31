import { readProductFile } from "../adapters/files/product-file-reader";

import type {
    ProductFileRow,
    ProductImportPreview,
} from "../domain/product-import";
import { validateProductImport } from "./validate-product-import";


export async function previewProductImport(
    file: File,
): Promise<ProductImportPreview> {
    if (!file || file.size === 0) {
        throw new Error("Selecione um arquivo válido.");
    }

    const rows: ProductFileRow[] = await readProductFile(file);

    if (rows.length === 0) {
        throw new Error("O arquivo não possui produtos para importar.");
    }

    const results = validateProductImport(rows);

    const validCount = results.filter((row) => row.valid).length;

    return {
        total: results.length,
        validCount,
        invalidCount: results.length - validCount,
        rows: results,
    };
}