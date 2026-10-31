import type {
    CompleteSaleInput,
    Sale,
    SaleDetails,
    SaleReceipt,
} from "../domain/sale";

export interface SaleRepository {
    complete(
        storeId: string,
        input: CompleteSaleInput,
    ): Promise<SaleReceipt>;

    findAll(storeId: string): Promise<Sale[]>;

    findById(
        storeId: string,
        saleId: string,
    ): Promise<SaleDetails | null>;

    findAllDetails(storeId: string): Promise<SaleDetails[]>;
}
