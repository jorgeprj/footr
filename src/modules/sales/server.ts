import "server-only";

import { CompleteSale } from "./application/complete-sale";
import { SupabaseSaleRepository } from "./adapters/supabase/supabase-sale-repository";
import { createStoreUseCases } from "@/modules/stores/server";

export async function createSaleUseCases() {
    const storeUseCases = createStoreUseCases();
    const store = await storeUseCases.getCurrentUserStore();

    if (!store) {
        throw new Error("Loja não identificada.");
    }

    const saleRepository = new SupabaseSaleRepository();

    return {
        completeSale: new CompleteSale(saleRepository),
        storeId: store.id,
    };
}
