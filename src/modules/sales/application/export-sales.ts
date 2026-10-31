
import type { SaleDetails } from "../domain/sale";
import type { SaleRepository } from "../ports/sale-repository";

export class ExportSales {
    constructor(private readonly saleRepository: SaleRepository) {}

    async execute(storeId: string): Promise<SaleDetails[]> {
        if (!storeId?.trim()) {
            throw new Error("Loja não identificada.");
        }

        return this.saleRepository.findAllDetails(storeId);
    }
}
