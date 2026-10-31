import type { Sale } from "../domain/sale";
import type { SaleRepository } from "../ports/sale-repository";

export class ListSales {
    constructor(
        private readonly saleRepository: SaleRepository,
    ) {}

    async execute(storeId: string): Promise<Sale[]> {
        if (!storeId?.trim()) {
            throw new Error("Loja não identificada.");
        }

        return this.saleRepository.findAll(storeId);
    }
}
