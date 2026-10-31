"use server";

import type { ProductInput } from "@/modules/products/domain/product";
import { createProductUseCases } from "@/modules/products/server";

export async function createProduct(input: ProductInput) {
    const { createProduct: createProductUseCase, storeId } =
        await createProductUseCases();

    return createProductUseCase.execute(storeId, input);
}