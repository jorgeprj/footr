"use server";

import type { ProductInput } from "@/modules/products/domain/product";
import { createProductUseCases } from "@/modules/products/server";

export async function updateProduct(
    productId: string,
    input: ProductInput,
) {
    if (!productId?.trim()) {
        throw new Error("Produto não identificado.");
    }

    const { updateProduct: updateProductUseCase, storeId } =
        await createProductUseCases();

    return updateProductUseCase.execute(
        storeId,
        productId,
        input,
    );
}