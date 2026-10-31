import type {
    CompleteSaleInput,
    SaleReceipt,
} from "../domain/sale";

export interface SaleRepository {
    complete(
        storeId: string,
        input: CompleteSaleInput,
    ): Promise<SaleReceipt>;
}
