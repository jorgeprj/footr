"use server";

import { createInitialStore } from "@/modules/stores/application/use-cases/create-initial-store";
import { createSupabaseStoreGateway } from "@/modules/stores/adapters/supabase/supabase-store-gateway";

export interface StoreActionState {
    error?: string;
    success?: boolean;
}

export async function createInitialStoreAction(
    _previousState: StoreActionState,
    formData: FormData,
): Promise<StoreActionState> {
    const name = String(formData.get("name") ?? "").trim();

    if (!name) {
        return { error: "Informe o nome da sua loja." };
    }

    if (name.length < 2) {
        return { error: "O nome da loja deve ter pelo menos 2 caracteres." };
    }

    if (name.length > 100) {
        return { error: "O nome da loja deve ter até 100 caracteres." };
    }

    try {
        const storeGateway = createSupabaseStoreGateway();

        await createInitialStore(storeGateway, name);

        return { success: true };
    } catch (error) {
        console.error("Create store error:", error);

        return {
            error: "Não foi possível criar sua loja. Tente novamente.",
        };
    }
}
