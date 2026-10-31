import type { Product, ProductInput } from "../domain/product";

export interface ProductRepository {
    create(
        storeId: string,
        input: ProductInput,
    ): Promise<Product>;

    createMany(
        storeId: string,
        inputs: ProductInput[],
    ): Promise<Product[]>;

    findAll(storeId: string): Promise<Product[]>;

    update(
        storeId: string,
        productId: string,
        input: ProductInput,
    ): Promise<Product>;
}