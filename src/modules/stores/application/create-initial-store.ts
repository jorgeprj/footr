import type { StoreGateway } from "../ports/store-gateway";

export async function createInitialStore(
    storeGateway: StoreGateway,
    name: string,
) {
    const normalizedName = name.trim();

    if (!normalizedName) {
        throw new Error("O nome da loja é obrigatório.");
    }

    if (normalizedName.length > 100) {
        throw new Error("O nome da loja deve ter até 100 caracteres.");
    }

    return storeGateway.createInitialStore(normalizedName);
}