import {
    validateCompleteSale,
    type CompleteSaleInput,
    type SaleReceipt,
} from "../domain/sale";
import type { SaleRepository } from "../ports/sale-repository";

export class CompleteSale {
    constructor(
        private readonly saleRepository: SaleRepository,
    ) {}

    async execute(
        storeId: string,
        input: CompleteSaleInput,
    ): Promise<SaleReceipt> {
        if (!storeId?.trim()) {
            throw new Error("Loja não identificada.");
        }

        const errors = validateCompleteSale(input);

        if (errors.length > 0) {
            throw new Error(errors.join(" "));
        }

        return this.saleRepository.complete(storeId, {
            ...input,
            customerName: input.customerName?.trim() || undefined,
            discountValue: Math.round(input.discountValue * 100) / 100,
        });
    }
}
