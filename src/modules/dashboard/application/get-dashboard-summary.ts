
import {
    generateDashboardSummary,
    type DashboardSummary,
} from "../domain/dashboard-summary";

import type { DashboardRepository } from "../ports/dashboard-repository";

export type GetDashboardSummaryInput = {
    startDate: string;
    endDate: string;
};

export class GetDashboardSummary {
    constructor(
        private readonly dashboardRepository: DashboardRepository,
    ) { }

    async execute(
        storeId: string,
        input: GetDashboardSummaryInput,
    ): Promise<DashboardSummary> {
        if (!storeId?.trim()) {
            throw new Error("Loja não identificada.");
        }

        if (!input.startDate || !input.endDate) {
            throw new Error("Informe o período do dashboard.");
        }

        const datePattern = /^\d{4}-\d{2}-\d{2}$/;

        if (
            !datePattern.test(input.startDate) ||
            !datePattern.test(input.endDate)
        ) {
            throw new Error("Informe datas válidas.");
        }

        if (input.startDate > input.endDate) {
            throw new Error(
                "A data inicial deve ser anterior à data final.",
            );
        }

        const [sales, availableProductsCount] = await Promise.all([
            this.dashboardRepository.findCompletedSalesByPeriod(
                storeId,
                input.startDate,
                input.endDate,
            ),
            this.dashboardRepository.countAvailableProducts(storeId),
        ]);

        return generateDashboardSummary(
            sales,
            availableProductsCount,
            input.startDate,
            input.endDate,
        );
    }
}
