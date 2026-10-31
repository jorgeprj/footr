"use server";

import type { ProductInput } from "@/modules/products/domain/product";
import { createProductUseCases } from "@/modules/products/server";

function isProductInput(value: unknown): value is ProductInput {
    if (!value || typeof value !== "object") {
        return false;
    }

    const product = value as Record<string, unknown>;

    return (
        typeof product.teamName === "string" &&
        typeof product.season === "string" &&
        typeof product.type === "string" &&
        typeof product.version === "string" &&
        typeof product.size === "string" &&
        typeof product.costPrice === "number" &&
        typeof product.salePrice === "number"
    );
}

export async function importProducts(products: unknown[]) {
    if (!Array.isArray(products) || products.length === 0) {
        throw new Error("Nenhum produto para importar.");
    }

    if (!products.every(isProductInput)) {
        throw new Error("Os dados dos produtos são inválidos.");
    }

    const {
        importProducts: importProductsUseCase,
        storeId,
    } = await createProductUseCases();

    const importedProducts = await importProductsUseCase.execute(
        storeId,
        products,
    );

    return {
        count: importedProducts.length,
    };
}