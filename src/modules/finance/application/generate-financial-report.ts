import {
    generateFinancialReport,
    type FinancialReport,
    type PaymentFees,
} from "../domain/financial-report";

import type { FinancialReportRepository } from "../ports/financial-report-repository";

export type GenerateFinancialReportInput = {
    startDate: string;
    endDate: string;
    fees: PaymentFees;
};

export class GenerateFinancialReport {
    constructor(
        private readonly financialReportRepository: FinancialReportRepository,
    ) { }

    async execute(
        storeId: string,
        input: GenerateFinancialReportInput,
    ): Promise<FinancialReport> {
        if (!storeId?.trim()) {
            throw new Error("Loja não identificada.");
        }

        if (!input.startDate || !input.endDate) {
            throw new Error("Informe o período do relatório.");
        }

        if (input.startDate > input.endDate) {
            throw new Error("A data inicial deve ser anterior à data final.");
        }

        const sales =
            await this.financialReportRepository.findCompletedSalesByPeriod(
                storeId,
                input.startDate,
                input.endDate,
            );

        return generateFinancialReport(
            sales,
            input.fees,
            input.startDate,
            input.endDate,
        );
    }
}
