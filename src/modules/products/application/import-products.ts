import {
    validateProduct,
    type Product,
    type ProductInput,
} from "../domain/product";

import type { ProductRepository } from "../ports/product-repository";

export class ImportProducts {
    constructor(
        private readonly productRepository: ProductRepository,
    ) {}

    async execute(
        storeId: string,
        products: ProductInput[],
    ): Promise<Product[]> {
        if (!storeId.trim()) {
            throw new Error("Loja não identificada.");
        }

        if (products.length === 0) {
            throw new Error("Nenhum produto para importar.");
        }

        for (const [index, product] of products.entries()) {
            const errors = validateProduct(product);

            if (Object.keys(errors).length > 0) {
                throw new Error(
                    `Produto ${index + 1}: ${Object.values(errors).join(" ")}`,
                );
            }
        }

        return this.productRepository.createMany(
            storeId,
            products,
        );
    }
}