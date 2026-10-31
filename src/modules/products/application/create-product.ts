import {
    validateProduct,
    type Product,
    type ProductInput,
} from "../domain/product";

import type { ProductRepository } from "../ports/product-repository";

export class CreateProduct {
    constructor(
        private readonly productRepository: ProductRepository,
    ) {}

    async execute(
        storeId: string,
        input: ProductInput,
    ): Promise<Product> {
        if (!storeId.trim()) {
            throw new Error("Loja não identificada.");
        }

        const errors = validateProduct(input);

        if (Object.keys(errors).length > 0) {
            throw new Error(Object.values(errors).join(" "));
        }

        return this.productRepository.create(storeId, input);
    }
}