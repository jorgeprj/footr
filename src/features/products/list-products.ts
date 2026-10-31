"use server";

import { createProductUseCases } from "@/modules/products/server";

export async function listProducts() {
    const { listProducts: listProductsUseCase, storeId } =
        await createProductUseCases();

    return listProductsUseCase.execute(storeId);
}