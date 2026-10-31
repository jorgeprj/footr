import "server-only";

import { createClient } from "@/shared/lib/supabase/server";
import type {
    CompleteSaleInput,
    SaleReceipt,
} from "../../domain/sale";
import type { SaleRepository } from "../../ports/sale-repository";

export class SupabaseSaleRepository implements SaleRepository {
    async complete(
        storeId: string,
        input: CompleteSaleInput,
    ): Promise<SaleReceipt> {
        const supabase = await createClient();

        const { data, error } = await supabase.rpc("complete_sale", {
            p_store_id: storeId,
            p_product_ids: input.productIds,
            p_payment_method: input.paymentMethod,
            p_customer_name: input.customerName?.trim() || null,
            p_discount_type: input.discountType,
            p_discount_value: input.discountValue,
        });

        if (error) {
            throw new Error(
                error.message || "Não foi possível finalizar a venda.",
            );
        }

        if (!data) {
            throw new Error("A venda não retornou um identificador válido.");
        }

        return {
            saleId: data,
        };
    }
}
