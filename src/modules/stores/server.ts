import "server-only";

import { createSupabaseStoreGateway } from "./adapters/supabase/supabase-store-gateway";
import { createInitialStore } from "./application/create-initial-store";
import { getCurrentUserStore } from "./application/get-current-user-store";

export function createStoreUseCases() {
    const gateway = createSupabaseStoreGateway();

    return {
        createInitialStore: (name: string) =>
            createInitialStore(gateway, name),

        getCurrentUserStore: () =>
            getCurrentUserStore(gateway),
    };
}