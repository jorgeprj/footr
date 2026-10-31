"use server";

import { createDashboardUseCases } from "@/modules/dashboard/server";

type GetDashboardSummaryInput = {
    startDate: string;
    endDate: string;
};

function validateInput(input: GetDashboardSummaryInput): void {
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;

    if (
        !input ||
        !datePattern.test(input.startDate) ||
        !datePattern.test(input.endDate)
    ) {
        throw new Error("Informe um período válido.");
    }

    if (input.startDate > input.endDate) {
        throw new Error(
            "A data inicial deve ser anterior à data final.",
        );
    }
}

export async function getDashboardSummary(
    input: GetDashboardSummaryInput,
) {
    try {
        validateInput(input);

        const { storeId, getDashboardSummary: useCase } =
            await createDashboardUseCases();

        const summary = await useCase.execute(storeId, input);

        return {
            success: true as const,
            data: summary,
        };
    } catch (error) {
        return {
            success: false as const,
            error: error instanceof Error
                ? error.message
                : "Não foi possível carregar o dashboard.",
        };
    }
}
