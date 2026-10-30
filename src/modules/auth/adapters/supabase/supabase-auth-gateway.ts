import type { AuthGateway } from "../../ports/auth-gateway";
import { createClient } from "@/shared/lib/supabase/server";

export function createSupabaseAuthGateway(): AuthGateway {
    return {
        async signIn(email, password) {
            const supabase = await createClient();

            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            return {
                user: data.user
                    ? {
                        id: data.user.id,
                        email: data.user.email,
                    }
                    : null,
                error: error?.message ?? null,
            };
        },

        async signUp(email, password) {
            const supabase = await createClient();

            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            });

            return {
                user: data.user
                    ? {
                        id: data.user.id,
                        email: data.user.email,
                    }
                    : null,
                error: error?.message ?? null,
            };
        },

        async signOut() {
            const supabase = await createClient();
            const { error } = await supabase.auth.signOut();

            if (error) {
                throw new Error(error.message);
            }
        },

        async getUser() {
            const supabase = await createClient();
            const { data, error } = await supabase.auth.getUser();

            if (error || !data.user) {
                return null;
            }

            return {
                id: data.user.id,
                email: data.user.email,
            };
        },
    };
}