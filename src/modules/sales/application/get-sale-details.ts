import type { SaleDetails } from "../domain/sale";
import type { SaleRepository } from "../ports/sale-repository";

export class GetSaleDetails {
    constructor(
        private readonly saleRepository: SaleRepository,
    ) {}

    async execute(
        storeId: string,
        saleId: string,
    ): Promise<SaleDetails> {
        if (!storeId?.trim()) {
            throw new Error("Loja não identificada.");
        }

        if (!saleId?.trim()) {
            throw new Error("Identificador da venda inválido.");
        }

        const sale = await this.saleRepository.findById(
            storeId,
            saleId,
        );

        if (!sale) {
            throw new Error("Venda não encontrada.");
        }

        return sale;
    }
}
