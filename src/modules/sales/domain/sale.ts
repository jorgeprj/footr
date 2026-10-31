export type PaymentMethod =
    | "installment"
    | "credit"
    | "debit"
    | "pix"
    | "cash";

export type DiscountType = "fixed" | "percentage";

export interface CompleteSaleInput {
    productIds: string[];
    paymentMethod: PaymentMethod;
    customerName?: string;
    discountType: DiscountType;
    discountValue: number;
}

export interface SaleReceipt {
    saleId: string;
}

export function calculateDiscount(
    subtotal: number,
    discountType: DiscountType,
    discountValue: number,
): number {
    if (
        !Number.isFinite(subtotal) ||
        !Number.isFinite(discountValue) ||
        subtotal < 0 ||
        discountValue < 0
    ) {
        throw new Error("Valores do desconto inválidos.");
    }

    if (discountType === "percentage") {
        if (discountValue > 100) {
            throw new Error("O desconto percentual não pode ultrapassar 100%.");
        }

        return Math.round(subtotal * (discountValue / 100) * 100) / 100;
    }

    return Math.min(
        Math.round(discountValue * 100) / 100,
        subtotal,
    );
}

export function validateCompleteSale(
    input: CompleteSaleInput,
): string[] {
    const errors: string[] = [];

    if (!input.productIds.length) {
        errors.push("Adicione pelo menos um produto à venda.");
    }

    if (input.productIds.some((id) => !id.trim())) {
        errors.push("Existem identificadores de produtos inválidos.");
    }

    if (new Set(input.productIds).size !== input.productIds.length) {
        errors.push("Não é permitido adicionar o mesmo produto duas vezes.");
    }

    const paymentMethods: PaymentMethod[] = [
        "installment",
        "credit",
        "debit",
        "pix",
        "cash",
    ];

    if (!paymentMethods.includes(input.paymentMethod)) {
        errors.push("Selecione uma forma de pagamento válida.");
    }

    if (
        input.discountType !== "fixed" &&
        input.discountType !== "percentage"
    ) {
        errors.push("Selecione um tipo de desconto válido.");
    }

    if (
        !Number.isFinite(input.discountValue) ||
        input.discountValue < 0
    ) {
        errors.push("Informe um desconto válido.");
    }

    if (
        input.discountType === "percentage" &&
        input.discountValue > 100
    ) {
        errors.push("O desconto percentual não pode ultrapassar 100%.");
    }

    if (input.customerName && input.customerName.length > 120) {
        errors.push("O nome do cliente deve ter no máximo 120 caracteres.");
    }

    return errors;
}
