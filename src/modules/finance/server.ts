import "server-only";

import { GenerateFinancialReport } from "./application/generate-financial-report";
import { SupabaseFinancialReportRepository } from "./adapters/supabase/supabase-financial-report-repository";
import { createStoreUseCases } from "../stores/server";

export async function createFinancialReportUseCases() {
    const storeUseCases = createStoreUseCases();
    const store = await storeUseCases.getCurrentUserStore();

    if (!store) {
        throw new Error("Loja não identificada.");
    }

    const financialReportRepository =
        new SupabaseFinancialReportRepository();

    return {
        storeId: store.id,
        generateFinancialReport: new GenerateFinancialReport(
            financialReportRepository,
        ),
    };
}
