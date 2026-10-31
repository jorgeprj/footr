"use server";

import { createSaleUseCases } from "@/modules/sales/server";
import type { PaymentMethod } from "@/modules/sales/domain/sale";

type DiscountType = "fixed" | "percentage";

interface CompleteSaleActionInput {
    productIds: string[];
    paymentMethod: PaymentMethod;
    customerName?: string;
    discountType: DiscountType;
    discountValue: number;
}

type CompleteSaleActionResult =
    | {
        success: true;
        saleId: string;
    }
    | {
        success: false;
        error: string;
    };

export async function completeSaleAction(
    input: CompleteSaleActionInput,
): Promise<CompleteSaleActionResult> {
    try {
        if (
            !input ||
            !Array.isArray(input.productIds) ||
            typeof input.paymentMethod !== "string" ||
            !["fixed", "percentage"].includes(input.discountType) ||
            typeof input.discountValue !== "number" ||
            !Number.isFinite(input.discountValue)
        ) {
            return {
                success: false,
                error: "Dados da venda inválidos.",
            };
        }

        const { completeSale, storeId } = await createSaleUseCases();

        const receipt = await completeSale.execute(storeId, {
            productIds: input.productIds,
            paymentMethod: input.paymentMethod,
            customerName: input.customerName,
            discountType: input.discountType,
            discountValue: input.discountValue,
        });

        return {
            success: true,
            saleId: receipt.saleId,
        };
    } catch (error) {
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Não foi possível finalizar a venda.",
        };
    }
}
