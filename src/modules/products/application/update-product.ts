import {
    validateProduct,
    type Product,
    type ProductInput,
} from "../domain/product";

import type { ProductRepository } from "../ports/product-repository";

export class UpdateProduct {
    constructor(
        private readonly productRepository: ProductRepository,
    ) {}

    async execute(
        storeId: string,
        productId: string,
        input: ProductInput,
    ): Promise<Product> {
        if (!storeId.trim()) {
            throw new Error("Loja não identificada.");
        }

        if (!productId.trim()) {
            throw new Error("Produto não identificado.");
        }

        const errors = validateProduct(input);

        if (Object.keys(errors).length > 0) {
            throw new Error(Object.values(errors).join(" "));
        }

        return this.productRepository.update(
            storeId,
            productId,
            input,
        );
    }
}