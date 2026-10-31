"use client";

import { exportSales } from "./export-sales";
import {
    downloadSalesExport,
    type SalesExportFormat,
} from "./export-sales-file";

export async function handleSalesExport(
    format: SalesExportFormat,
): Promise<{ success: boolean; error?: string }> {
    try {
        const result = await exportSales();

        if (!result.success) {
            return {
                success: false,
                error: result.error,
            };
        }

        if (!result.data.length) {
            return {
                success: false,
                error: "Não existem vendas para exportar.",
            };
        }

        await downloadSalesExport(result.data, format);

        return { success: true };
    } catch (error) {
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Não foi possível exportar as vendas.",
        };
    }
}
