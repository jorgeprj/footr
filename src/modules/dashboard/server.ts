import "server-only";

import { GetDashboardSummary } from "./application/get-dashboard-summary";
import { createStoreUseCases } from "../stores/server";
import { SupabaseDashboardRepository } from "./adapters/supabase/supabase-dashboard-repository";


export async function createDashboardUseCases() {
    const storeUseCases = createStoreUseCases();
    const store = await storeUseCases.getCurrentUserStore();

    if (!store) {
        throw new Error("Loja não identificada.");
    }

    const dashboardRepository = new SupabaseDashboardRepository();

    return {
        storeId: store.id,
        getDashboardSummary: new GetDashboardSummary(
            dashboardRepository,
        ),
    };
}
