import "server-only";

import { createClient } from "@/shared/lib/supabase/server";

import type {
    FinancialPaymentMethod,
    FinancialSale,
} from "../../domain/financial-report";

import type { FinancialReportRepository } from "../../ports/financial-report-repository";

type SaleRow = {
    id: string;
    payment_method: string;
    status: string;
    subtotal: number | string;
    discount_amount: number | string;
    total_amount: number | string;
    sold_at: string;
};

type SaleItemRow = {
    sale_id: string;
    unit_cost_snapshot: number | string;
};

const PAYMENT_METHODS: FinancialPaymentMethod[] = [
    "pix",
    "cash",
    "debit",
    "credit",
    "installment",
];

function getNextDate(date: string): string {
    const nextDate = new Date(`${date}T00:00:00.000Z`);

    nextDate.setUTCDate(nextDate.getUTCDate() + 1);

    return nextDate.toISOString();
}

export class SupabaseFinancialReportRepository
    implements FinancialReportRepository
{
    async findCompletedSalesByPeriod(
        storeId: string,
        startDate: string,
        endDate: string,
    ): Promise<FinancialSale[]> {
        const supabase = await createClient();

        const startDateTime = `${startDate}T00:00:00.000Z`;
        const endDateTime = getNextDate(endDate);

        const { data: salesData, error: salesError } = await supabase
            .from("sales")
            .select(`
                id,
                payment_method,
                status,
                subtotal,
                discount_amount,
                total_amount,
                sold_at
            `)
            .eq("store_id", storeId)
            .eq("status", "completed")
            .gte("sold_at", startDateTime)
            .lt("sold_at", endDateTime)
            .order("sold_at", { ascending: true });

        if (salesError) {
            throw new Error(
                `Erro ao buscar vendas: ${salesError.message}`,
            );
        }

        const sales = (salesData ?? []) as SaleRow[];

        if (sales.length === 0) {
            return [];
        }

        const saleIds = sales.map((sale) => sale.id);

        const { data: itemsData, error: itemsError } = await supabase
            .from("sale_items")
            .select("sale_id, unit_cost_snapshot")
            .eq("store_id", storeId)
            .in("sale_id", saleIds);

        if (itemsError) {
            throw new Error(
                `Erro ao buscar itens das vendas: ${itemsError.message}`,
            );
        }

        const items = (itemsData ?? []) as SaleItemRow[];

        const itemsBySale = new Map<string, SaleItemRow[]>();

        for (const item of items) {
            const currentItems = itemsBySale.get(item.sale_id) ?? [];

            currentItems.push(item);

            itemsBySale.set(item.sale_id, currentItems);
        }

        return sales.map((sale) => {
            if (
                !PAYMENT_METHODS.includes(
                    sale.payment_method as FinancialPaymentMethod,
                )
            ) {
                throw new Error(
                    `Método de pagamento inválido na venda ${sale.id}.`,
                );
            }

            return {
                id: sale.id,
                paymentMethod:
                    sale.payment_method as FinancialPaymentMethod,
                status: "completed",
                subtotal: Number(sale.subtotal),
                discountAmount: Number(sale.discount_amount),
                totalAmount: Number(sale.total_amount),
                soldAt: sale.sold_at,
                items: (itemsBySale.get(sale.id) ?? []).map((item) => ({
                    unitCostSnapshot: Number(item.unit_cost_snapshot),
                })),
            };
        });
    }
}
