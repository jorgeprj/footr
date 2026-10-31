"use server";

import { createSaleUseCases } from "@/modules/sales/server";

export async function exportSales() {
    try {
        const { exportSales: exportSalesUseCase, storeId } =
            await createSaleUseCases();

        const sales = await exportSalesUseCase.execute(storeId);

        return {
            success: true as const,
            data: sales,
        };
    } catch (error) {
        return {
            success: false as const,
            error:
                error instanceof Error
                    ? error.message
                    : "Não foi possível exportar o histórico de vendas.",
        };
    }
}
