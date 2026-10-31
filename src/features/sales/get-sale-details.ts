"use server";

import { createSaleUseCases } from "@/modules/sales/server";

export async function getSaleDetails(saleId: string) {
    try {
        if (!saleId?.trim()) {
            return {
                success: false as const,
                error: "Identificador da venda inválido.",
            };
        }

        const { getSaleDetails: getSaleDetailsUseCase, storeId } =
            await createSaleUseCases();

        const sale = await getSaleDetailsUseCase.execute(storeId, saleId);

        return {
            success: true as const,
            data: sale,
        };
    } catch (error) {
        return {
            success: false as const,
            error:
                error instanceof Error
                    ? error.message
                    : "Não foi possível carregar os detalhes da venda.",
        };
    }
}
