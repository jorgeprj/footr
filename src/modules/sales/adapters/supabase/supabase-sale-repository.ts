
import "server-only";

import { createClient } from "@/shared/lib/supabase/server";
import type {
    CompleteSaleInput,
    Sale,
    SaleDetails,
    SaleItem,
    SaleItemPreview,
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

        return { saleId: data };
    }

    async findAll(storeId: string): Promise<Sale[]> {
        const supabase = await createClient();

        const { data: sales, error } = await supabase
            .from("sales")
            .select(`
                id,
                sale_number,
                customer_name,
                payment_method,
                status,
                subtotal,
                discount_amount,
                total_amount,
                sold_at,
                created_at
            `)
            .eq("store_id", storeId)
            .order("sold_at", { ascending: false });

        if (error) {
            throw new Error(
                error.message || "Não foi possível carregar o histórico de vendas.",
            );
        }

        if (!sales?.length) return [];

        const saleIds = sales.map((sale) => sale.id);

        const { data: saleItems, error: itemsError } = await supabase
            .from("sale_items")
            .select("sale_id, product_id")
            .eq("store_id", storeId)
            .in("sale_id", saleIds);

        if (itemsError) {
            throw new Error(
                itemsError.message || "Não foi possível carregar os itens das vendas.",
            );
        }

        const productIds = [
            ...new Set((saleItems ?? []).map((item) => item.product_id)),
        ];

        const { data: products, error: productsError } =
            productIds.length > 0
                ? await supabase
                    .from("products")
                    .select("id, team_name, season, type, version, size")
                    .eq("store_id", storeId)
                    .in("id", productIds)
                : { data: [], error: null };

        if (productsError) {
            throw new Error(
                productsError.message || "Não foi possível carregar os produtos.",
            );
        }

        const productsMap = new Map(
            (products ?? []).map((product) => [product.id, product]),
        );

        const previewsBySale = new Map<string, SaleItemPreview[]>();
        const itemCounts = new Map<string, number>();

        for (const item of saleItems ?? []) {
            itemCounts.set(
                item.sale_id,
                (itemCounts.get(item.sale_id) ?? 0) + 1,
            );

            const product = productsMap.get(item.product_id);
            if (!product) continue;

            const preview: SaleItemPreview = {
                productId: product.id,
                teamName: product.team_name,
                season: product.season,
                type: product.type,
                version: product.version,
                size: product.size,
            };

            const currentItems = previewsBySale.get(item.sale_id) ?? [];
            currentItems.push(preview);
            previewsBySale.set(item.sale_id, currentItems);
        }

        return sales.map((sale) => ({
            id: sale.id,
            saleNumber: Number(sale.sale_number),
            customerName: sale.customer_name,
            paymentMethod: sale.payment_method,
            status: sale.status,
            subtotal: Number(sale.subtotal),
            discountAmount: Number(sale.discount_amount),
            totalAmount: Number(sale.total_amount),
            soldAt: sale.sold_at,
            createdAt: sale.created_at,
            itemCount: itemCounts.get(sale.id) ?? 0,
            itemsPreview: previewsBySale.get(sale.id) ?? [],
        }));
    }

    async findById(
        storeId: string,
        saleId: string,
    ): Promise<SaleDetails | null> {
        const supabase = await createClient();

        const { data: sale, error } = await supabase
            .from("sales")
            .select(`
                id,
                sale_number,
                customer_name,
                payment_method,
                status,
                subtotal,
                discount_amount,
                total_amount,
                sold_at,
                created_at
            `)
            .eq("store_id", storeId)
            .eq("id", saleId)
            .maybeSingle();

        if (error) {
            throw new Error(
                error.message || "Não foi possível carregar os detalhes da venda.",
            );
        }

        if (!sale) return null;

        const { data: saleItems, error: itemsError } = await supabase
            .from("sale_items")
            .select(`
                id,
                product_id,
                product_code_snapshot,
                product_description_snapshot,
                unit_cost_snapshot,
                unit_price,
                discount_amount,
                line_total
            `)
            .eq("store_id", storeId)
            .eq("sale_id", saleId);

        if (itemsError) {
            throw new Error(
                itemsError.message || "Não foi possível carregar os itens da venda.",
            );
        }

        const items = await this.mapSaleItems(
            supabase,
            storeId,
            saleItems ?? [],
        );

        return this.mapSaleDetails(sale, items);
    }

    async findAllDetails(storeId: string): Promise<SaleDetails[]> {
        const supabase = await createClient();

        const { data: sales, error: salesError } = await supabase
            .from("sales")
            .select(`
                id,
                sale_number,
                customer_name,
                payment_method,
                status,
                subtotal,
                discount_amount,
                total_amount,
                sold_at,
                created_at
            `)
            .eq("store_id", storeId)
            .order("sold_at", { ascending: false });

        if (salesError) {
            throw new Error(
                salesError.message || "Não foi possível carregar o histórico de vendas.",
            );
        }

        if (!sales?.length) return [];

        const saleIds = sales.map((sale) => sale.id);

        const { data: saleItems, error: itemsError } = await supabase
            .from("sale_items")
            .select(`
                id,
                sale_id,
                product_id,
                product_code_snapshot,
                product_description_snapshot,
                unit_cost_snapshot,
                unit_price,
                discount_amount,
                line_total
            `)
            .eq("store_id", storeId)
            .in("sale_id", saleIds);

        if (itemsError) {
            throw new Error(
                itemsError.message || "Não foi possível carregar os itens das vendas.",
            );
        }

        const itemsBySale = new Map<string, SaleItem[]>();

        const itemsWithoutSaleId = (saleItems ?? []).map((item) => ({
            ...item,
            saleId: item.sale_id,
        }));

        const mappedItems = await this.mapSaleItems(
            supabase,
            storeId,
            itemsWithoutSaleId,
        );

        for (let index = 0; index < mappedItems.length; index++) {
            const saleId = itemsWithoutSaleId[index].saleId;
            const currentItems = itemsBySale.get(saleId) ?? [];

            currentItems.push(mappedItems[index]);
            itemsBySale.set(saleId, currentItems);
        }

        return sales.map((sale) =>
            this.mapSaleDetails(sale, itemsBySale.get(sale.id) ?? []),
        );
    }

    private async mapSaleItems(
        supabase: Awaited<ReturnType<typeof createClient>>,
        storeId: string,
        saleItems: Array<{
            id: string;
            product_id: string;
            product_code_snapshot: string;
            product_description_snapshot: string;
            unit_cost_snapshot: number;
            unit_price: number;
            discount_amount: number;
            line_total: number;
        }>,
    ): Promise<SaleItem[]> {
        if (!saleItems.length) return [];

        const productIds = [
            ...new Set(saleItems.map((item) => item.product_id)),
        ];

        const { data: products, error } = await supabase
            .from("products")
            .select("id, team_name, season, type, version, size")
            .eq("store_id", storeId)
            .in("id", productIds);

        if (error) {
            throw new Error(
                error.message || "Não foi possível carregar as informações dos produtos.",
            );
        }

        const productsMap = new Map(
            (products ?? []).map((product) => [product.id, product]),
        );

        return saleItems.map((item) => {
            const product = productsMap.get(item.product_id);

            if (!product) {
                throw new Error(
                    "Não foi possível identificar um produto desta venda.",
                );
            }

            return {
                id: item.id,
                productId: item.product_id,
                productCode: item.product_code_snapshot,
                productDescription: item.product_description_snapshot,
                unitCost: Number(item.unit_cost_snapshot),
                unitPrice: Number(item.unit_price),
                discountAmount: Number(item.discount_amount),
                lineTotal: Number(item.line_total),
                teamName: product.team_name,
                season: product.season,
                type: product.type,
                version: product.version,
                size: product.size,
            };
        });
    }

    private mapSaleDetails(
        sale: {
            id: string;
            sale_number: number;
            customer_name: string | null;
            payment_method: Sale["paymentMethod"];
            status: Sale["status"];
            subtotal: number;
            discount_amount: number;
            total_amount: number;
            sold_at: string;
            created_at: string;
        },
        items: SaleItem[],
    ): SaleDetails {
        return {
            id: sale.id,
            saleNumber: Number(sale.sale_number),
            customerName: sale.customer_name,
            paymentMethod: sale.payment_method,
            status: sale.status,
            subtotal: Number(sale.subtotal),
            discountAmount: Number(sale.discount_amount),
            totalAmount: Number(sale.total_amount),
            soldAt: sale.sold_at,
            createdAt: sale.created_at,
            itemCount: items.length,
            itemsPreview: items.map((item) => ({
                productId: item.productId,
                teamName: item.teamName,
                season: item.season,
                type: item.type,
                version: item.version,
                size: item.size,
            })),
            items,
        };
    }
}
