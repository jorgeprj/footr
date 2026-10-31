
"use server";

import {
    type FinancialPaymentMethod,
    type PaymentFees,
} from "@/modules/finance/domain/financial-report";

import { createFinancialReportUseCases } from "@/modules/finance/server";

type GenerateFinancialReportInput = {
    startDate: string;
    endDate: string;
    fees: PaymentFees;
};

const PAYMENT_METHODS: FinancialPaymentMethod[] = [
    "pix",
    "cash",
    "debit",
    "credit",
    "installment",
];

function validateInput(input: GenerateFinancialReportInput): void {
    if (!input.startDate || !input.endDate) {
        throw new Error("Informe o período do relatório.");
    }

    const datePattern = /^\d{4}-\d{2}-\d{2}$/;

    if (
        !datePattern.test(input.startDate) ||
        !datePattern.test(input.endDate)
    ) {
        throw new Error("Informe datas válidas.");
    }

    if (input.startDate > input.endDate) {
        throw new Error("A data inicial deve ser anterior à data final.");
    }

    if (!input.fees || typeof input.fees !== "object") {
        throw new Error("Informe as taxas de pagamento.");
    }

    for (const method of PAYMENT_METHODS) {
        const fee = input.fees[method];

        if (
            typeof fee !== "number" ||
            !Number.isFinite(fee) ||
            fee < 0 ||
            fee > 100
        ) {
            throw new Error(
                `Informe uma taxa válida para ${method}.`,
            );
        }
    }
}

export async function generateFinancialReport(
    input: GenerateFinancialReportInput,
) {
    try {
        validateInput(input);

        const { storeId, generateFinancialReport: useCase } =
            await createFinancialReportUseCases();

        const report = await useCase.execute(storeId, input);

        return {
            success: true as const,
            data: report,
        };
    } catch (error) {
        return {
            success: false as const,
            error:
                error instanceof Error
                    ? error.message
                    : "Não foi possível gerar o relatório financeiro.",
        };
    }
}
