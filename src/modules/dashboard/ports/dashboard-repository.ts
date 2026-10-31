import type { DashboardSale } from "../domain/dashboard-summary";

export interface DashboardRepository {
    findCompletedSalesByPeriod(
        storeId: string,
        startDate: string,
        endDate: string,
    ): Promise<DashboardSale[]>;

    countAvailableProducts(
        storeId: string,
    ): Promise<number>;
}
