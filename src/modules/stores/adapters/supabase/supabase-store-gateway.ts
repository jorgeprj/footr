import { createClient } from "@/shared/lib/supabase/server";

import type {StoreGateway} from "../../ports/store-gateway";

export function createSupabaseStoreGateway(): StoreGateway {
    return {
        async createInitialStore(name) {
            const supabase = await createClient();

            const { data, error } = await supabase.rpc(
                "create_initial_store",
                {
                    p_store_name: name,
                },
            );

            if (error) {
                throw new Error(error.message);
            }

            const store = Array.isArray(data) ? data[0] : data;

            if (!store?.store_id || !store?.store_slug) {
                throw new Error("The store could not be created.");
            }

            return {
                id: store.store_id,
                name,
                slug: store.store_slug,
            };
        },

        async getCurrentUserStore() {
            const supabase = await createClient();

            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser();

            if (userError || !user) {
                return null;
            }

            const { data: membership, error } = await supabase
                .from("store_members")
                .select("store_id")
                .eq("user_id", user.id)
                .maybeSingle();

            if (error || !membership) {
                return null;
            }

            const { data: store, error: storeError } = await supabase
                .from("stores")
                .select("id, name, slug")
                .eq("id", membership.store_id)
                .maybeSingle();

            if (storeError || !store) {
                return null;
            }

            return store;
        },
    };
}