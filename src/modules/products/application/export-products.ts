import type { Product } from "../domain/product";

import type { ProductRepository } from "../ports/product-repository";

export class ExportProducts {
    constructor(
        private readonly productRepository: ProductRepository,
    ) {}

    async execute(storeId: string): Promise<Product[]> {
        if (!storeId.trim()) {
            throw new Error("Loja não identificada.");
        }

        return this.productRepository.findAll(storeId);
    }
}