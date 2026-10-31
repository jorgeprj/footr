export { validateProduct } from "./domain/product";

export type {
    Product,
    ProductInput,
    ProductStatus,
    ProductValidationErrors,
} from "./domain/product";

export type { ProductRepository } from "./ports/product-repository";

export type {
    ProductFileRow,
    ProductImportData,
    ProductImportPreview,
    ProductImportResult,
} from "./domain/product-import";
