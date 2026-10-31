import type { StoreGateway } from "../ports/store-gateway";

export async function getCurrentUserStore(storeGateway: StoreGateway) {
    return storeGateway.getCurrentUserStore();
}