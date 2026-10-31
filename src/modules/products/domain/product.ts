export type ProductStatus = "available" | "sold" | "archived";

export interface ProductInput {
    teamName: string;
    season: string;
    type: string;
    version: string;
    size: string;
    costPrice: number;
    salePrice: number;
}

export interface Product extends ProductInput {
    id: string;
    storeId: string;
    footrCode: string;
    status: ProductStatus;
    createdAt: string;
    updatedAt: string;
}

export type ProductValidationErrors = Partial<
    Record<keyof ProductInput, string>
>;

const MAX_PRICE = 9_999_999_999.99;

export function validateProduct(
    input: ProductInput,
): ProductValidationErrors {
    const errors: ProductValidationErrors = {};

    if (!input.teamName.trim()) {
        errors.teamName = "Informe o nome do time.";
    }

    if (!input.season.trim()) {
        errors.season = "Informe a temporada.";
    }

    if (!input.type.trim()) {
        errors.type = "Informe o tipo da camisa.";
    }

    if (!input.version.trim()) {
        errors.version = "Informe a versão da camisa.";
    }

    if (!input.size.trim()) {
        errors.size = "Informe o tamanho.";
    }

    const prices = [
        { field: "costPrice" as const, value: input.costPrice },
        { field: "salePrice" as const, value: input.salePrice },
    ];

    for (const { field, value } of prices) {
        if (!Number.isFinite(value) || value < 0) {
            errors[field] = "Informe um valor monetário válido.";
            continue;
        }

        if (value > MAX_PRICE) {
            errors[field] = "O valor ultrapassa o limite permitido.";
            continue;
        }

        const decimalPlaces = value.toString().split(".")[1]?.length ?? 0;

        if (decimalPlaces > 2) {
            errors[field] = "Utilize no máximo duas casas decimais.";
        }
    }

    return errors;
}