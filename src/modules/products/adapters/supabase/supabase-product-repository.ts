import "server-only";

import { randomBytes } from "node:crypto";

import { createClient } from "@/shared/lib/supabase/server";

import type { Product, ProductInput } from "../../domain/product";
import type { ProductRepository } from "../../ports/product-repository";

const CODE_CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function generateFootrCode(): string {
    const bytes = randomBytes(6);

    const code = Array.from(bytes, (byte) => {
        return CODE_CHARACTERS[byte % CODE_CHARACTERS.length];
    }).join("");

    return `FTR-${code}`;
}

function mapProduct(row: Record<string, unknown>): Product {
    return {
        id: row.id as string,
        storeId: row.store_id as string,
        footrCode: row.footr_code as string,
        teamName: row.team_name as string,
        season: row.season as string,
        type: row.type as string,
        version: row.version as string,
        size: row.size as string,
        costPrice: Number(row.cost_price),
        salePrice: Number(row.sale_price),
        status: row.status as Product["status"],
        createdAt: row.created_at as string,
        updatedAt: row.updated_at as string,
    };
}

function mapProductInput(input: ProductInput) {
    return {
        team_name: input.teamName.trim(),
        season: input.season.trim(),
        type: input.type.trim(),
        version: input.version.trim(),
        size: input.size.trim(),
        cost_price: input.costPrice,
        sale_price: input.salePrice,
    };
}

export function createSupabaseProductRepository(): ProductRepository {
    return {
        async create(storeId, input) {
            const supabase = await createClient();

            const { data, error } = await supabase
                .from("products")
                .insert({
                    store_id: storeId,
                    footr_code: generateFootrCode(),
                    ...mapProductInput(input),
                })
                .select()
                .single();

            if (error) {
                throw new Error(error.message);
            }

            return mapProduct(data);
        },

        async findAll(storeId) {
            const supabase = await createClient();

            const { data, error } = await supabase
                .from("products")
                .select("*")
                .eq("store_id", storeId)
                .order("created_at", { ascending: false });

            if (error) {
                throw new Error(error.message);
            }

            return (data ?? []).map(mapProduct);
        },

        async update(storeId, productId, input) {
            const supabase = await createClient();

            const { data, error } = await supabase
                .from("products")
                .update(mapProductInput(input))
                .eq("id", productId)
                .eq("store_id", storeId)
                .select()
                .single();

            if (error) {
                throw new Error(error.message);
            }

            return mapProduct(data);
        },

        async createMany(storeId, inputs) {
            const supabase = await createClient();

            const products = inputs.map((input) => ({
                store_id: storeId,
                footr_code: generateFootrCode(),
                ...mapProductInput(input),
            }));

            const { data, error } = await supabase
                .from("products")
                .insert(products)
                .select();

            if (error) {
                throw new Error(error.message);
            }

            return (data ?? []).map(mapProduct);
        },
    };
}
