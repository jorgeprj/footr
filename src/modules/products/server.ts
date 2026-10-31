import "server-only";

import { CreateProduct } from "./application/create-product";
import { ExportProducts } from "./application/export-products";
import { ImportProducts } from "./application/import-products";
import { ListProducts } from "./application/list-products";
import { UpdateProduct } from "./application/update-product";
import { previewProductImport } from "./application/preview-product-import";

import {
    exportProductsFile,
    type ProductExportFormat,
} from "./adapters/files/product-exporter";

import { createSupabaseProductRepository } from "./adapters/supabase/supabase-product-repository";

import { createStoreUseCases } from "@/modules/stores/server";

export async function createProductUseCases() {
    const storeUseCases = createStoreUseCases();
    const store = await storeUseCases.getCurrentUserStore();

    if (!store) {
        throw new Error("Loja não identificada.");
    }

    const repository = createSupabaseProductRepository();

    return {
        createProduct: new CreateProduct(repository),
        exportProducts: new ExportProducts(repository),
        importProducts: new ImportProducts(repository),
        listProducts: new ListProducts(repository),
        updateProduct: new UpdateProduct(repository),
        storeId: store.id,
    };
}

export async function previewProductsFile(file: File) {
    if (!(file instanceof File)) {
        throw new Error("Selecione um arquivo válido.");
    }

    const MAX_FILE_SIZE = 10 * 1024 * 1024;

    if (file.size > MAX_FILE_SIZE) {
        throw new Error("O arquivo deve ter no máximo 10 MB.");
    }

    const extension = file.name.split(".").pop()?.toLowerCase();

    if (!["csv", "xlsx", "json"].includes(extension ?? "")) {
        throw new Error(
            "Formato não suportado. Utilize CSV, XLSX ou JSON.",
        );
    }

    return previewProductImport(file);
}

export async function generateProductsExport(
    format: ProductExportFormat,
) {
    const supportedFormats: ProductExportFormat[] = [
        "json",
        "csv",
        "xlsx",
    ];

    if (!supportedFormats.includes(format)) {
        throw new Error("Formato de exportação não suportado.");
    }

    const {
        exportProducts: exportProductsUseCase,
        storeId,
    } = await createProductUseCases();

    const products = await exportProductsUseCase.execute(storeId);

    return exportProductsFile(products, format);
}