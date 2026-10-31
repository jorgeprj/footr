import type { FinancialSale } from "../domain/financial-report";

export interface FinancialReportRepository {
    findCompletedSalesByPeriod(
        storeId: string,
        startDate: string,
        endDate: string,
    ): Promise<FinancialSale[]>;
}
