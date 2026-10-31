import "server-only";

import { createClient } from "@/shared/lib/supabase/server";

import type { DashboardSale } from "../../domain/dashboard-summary";
import type { DashboardRepository } from "../../ports/dashboard-repository";

type SaleRow = {
    id: string;
    total_amount: number | string;
    sold_at: string;
};

type SaleItemRow = {
    sale_id: string;
    product_description_snapshot: string;
};

function getNextDate(date: string): string {
    const nextDate = new Date(`${date}T00:00:00.000Z`);
    nextDate.setUTCDate(nextDate.getUTCDate() + 1);

    return nextDate.toISOString();
}

export class SupabaseDashboardRepository implements DashboardRepository {
    async findCompletedSalesByPeriod(
        storeId: string,
        startDate: string,
        endDate: string,
    ): Promise<DashboardSale[]> {
        const supabase = await createClient();

        const startDateTime = `${startDate}T00:00:00.000Z`;
        const endDateTime = getNextDate(endDate);

        const { data: salesData, error: salesError } = await supabase
            .from("sales")
            .select("id, total_amount, sold_at")
            .eq("store_id", storeId)
            .eq("status", "completed")
            .gte("sold_at", startDateTime)
            .lt("sold_at", endDateTime)
            .order("sold_at", { ascending: true });

        if (salesError) {
            throw new Error(
                `Erro ao buscar vendas do dashboard: ${salesError.message}`,
            );
        }

        const sales = (salesData ?? []) as SaleRow[];

        if (sales.length === 0) {
            return [];
        }

        const saleIds = sales.map((sale) => sale.id);

        const { data: itemsData, error: itemsError } = await supabase
            .from("sale_items")
            .select("sale_id, product_description_snapshot")
            .eq("store_id", storeId)
            .in("sale_id", saleIds);

        if (itemsError) {
            throw new Error(
                `Erro ao buscar itens vendidos: ${itemsError.message}`,
            );
        }

        const items = (itemsData ?? []) as SaleItemRow[];

        const itemsBySale = new Map<string, SaleItemRow[]>();

        for (const item of items) {
            const currentItems = itemsBySale.get(item.sale_id) ?? [];
            currentItems.push(item);
            itemsBySale.set(item.sale_id, currentItems);
        }

        return sales.map((sale) => ({
            id: sale.id,
            totalAmount: Number(sale.total_amount),
            soldAt: sale.sold_at,
            items: (itemsBySale.get(sale.id) ?? []).map((item) => ({
                productDescriptionSnapshot:
                    item.product_description_snapshot,
            })),
        }));
    }

    async countAvailableProducts(storeId: string): Promise<number> {
        const supabase = await createClient();

        const { count, error } = await supabase
            .from("products")
            .select("id", { count: "exact", head: true })
            .eq("store_id", storeId)
            .eq("status", "available");

        if (error) {
            throw new Error(
                `Erro ao contar produtos disponíveis: ${error.message}`,
            );
        }

        return count ?? 0;
    }
}
