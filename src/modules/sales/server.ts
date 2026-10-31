import "server-only";

import { CompleteSale } from "./application/complete-sale";
import { ListSales } from "./application/list-sales";
import { GetSaleDetails } from "./application/get-sale-details";
import { ExportSales } from "./application/export-sales";
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
        listSales: new ListSales(saleRepository),
        getSaleDetails: new GetSaleDetails(saleRepository),
        exportSales: new ExportSales(saleRepository),
        storeId: store.id,
    };
}
