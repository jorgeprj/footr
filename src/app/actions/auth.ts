"use server";

import { redirect } from "next/navigation";

import { signIn } from "@/modules/auth/application/use-cases/sign-in";
import { signUp } from "@/modules/auth/application/use-cases/sign-up";
import { signOut } from "@/modules/auth/application/use-cases/sign-out";
import { createSupabaseAuthGateway } from "@/modules/auth/adapters/supabase/supabase-auth-gateway";
import { createSupabaseStoreGateway } from "@/modules/stores/adapters/supabase/supabase-store-gateway";

export interface AuthActionState {
    error?: string;
    success?: string;
}

export async function signInAction(_previousState: AuthActionState, formData: FormData): Promise<AuthActionState> {
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const password = String(formData.get("password") ?? "");

    if (!email || !password) {
        return { error: "Preencha seu e-mail e sua senha." };
    }

    const authGateway = createSupabaseAuthGateway();
    const result = await signIn(authGateway, email, password);

    if (result.error || !result.user) {
        return { error: "E-mail ou senha inválidos." };
    }

    const storeGateway = createSupabaseStoreGateway();
    const store = await storeGateway.getCurrentUserStore();

    redirect(store ? "/dashboard" : "/setup-store");
}

export async function signUpAction(_previousState: AuthActionState, formData: FormData): Promise<AuthActionState> {
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (!email || !password || !confirmPassword) {
        return { error: "Preencha todos os campos." };
    }

    if (password.length < 8) {
        return { error: "A senha deve ter pelo menos 8 caracteres." };
    }

    if (password !== confirmPassword) {
        return { error: "As senhas não coincidem." };
    }

    const authGateway = createSupabaseAuthGateway();
    const result = await signUp(authGateway, email, password);

    if (result.error || !result.user) {
        return {
            error: "Não foi possível criar sua conta. Verifique os dados ou tente outro e-mail.",
        };
    }

    return {
        success:
            "Conta criada! Confira seu e-mail para confirmar o cadastro. Depois, entre no Footr para configurar sua loja.",
    };
}

export async function signOutAction() {
    const authGateway = createSupabaseAuthGateway();

    await signOut(authGateway);

    redirect("/login");
}