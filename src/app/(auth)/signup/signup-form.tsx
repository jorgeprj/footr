
"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

import {
    signUpAction,
    type AuthActionState,
} from "@/app/actions/auth";

import { HugeiconsIcon } from "@hugeicons/react";
import { Tick02Icon } from "@hugeicons/core-free-icons";

const initialState: AuthActionState = {};

export function SignupForm() {
    const [state, formAction, pending] = useActionState(
        signUpAction,
        initialState,
    );

    const router = useRouter();

    useEffect(() => {
        if (!state.success) return;

        const timeout = window.setTimeout(() => {
            router.replace("/login");
        }, 5000);

        return () => window.clearTimeout(timeout);
    }, [state.success, router]);

    if (state.success) {
        return (
            <div className="success-screen fixed inset-0 z-50 flex min-h-screen items-center justify-center bg-white px-6 py-12">
                <div className="success-panel w-full max-w-100 text-center">
                    <div className="success-mark mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100">
                        <HugeiconsIcon
                            icon={Tick02Icon}
                            size={30}
                            className="text-zinc-950"
                            strokeWidth={2}
                        />
                    </div>

                    <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">
                        Verifique seu e-mail.
                    </h1>

                    <p className="mt-4 text-sm leading-6 text-zinc-500">
                        Sua conta foi criada com sucesso! Enviamos um link de
                        confirmação para seu e-mail. Acesse sua caixa de entrada
                        para confirmar seu cadastro.
                    </p>

                    <p className="mt-8 text-xs text-zinc-400">
                        Você será redirecionado para o login em alguns segundos.
                    </p>

                    <Link
                        href="/login"
                        className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-zinc-950 px-8 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
                    >
                        Ir para o login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <form action={formAction} className="space-y-5">
            <div className="space-y-2">
                <label
                    htmlFor="email"
                    className="block text-sm font-medium text-zinc-800"
                >
                    E-mail
                </label>

                <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="seu@email.com"
                    className="h-12 w-full rounded-lg bg-zinc-100 px-4 text-sm text-zinc-950 outline-none transition-all placeholder:text-zinc-500 focus:bg-white focus:ring-1 focus:ring-zinc-950"
                />
            </div>

            <div className="space-y-2">
                <label
                    htmlFor="password"
                    className="block text-sm font-medium text-zinc-800"
                >
                    Senha
                </label>

                <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    required
                    placeholder="Mínimo de 8 caracteres"
                    className="h-12 w-full rounded-lg bg-zinc-100 px-4 text-sm text-zinc-950 outline-none transition-all placeholder:text-zinc-500 focus:bg-white focus:ring-1 focus:ring-zinc-950"
                />
            </div>

            <div className="space-y-2">
                <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-zinc-800"
                >
                    Confirmar senha
                </label>

                <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    required
                    placeholder="Digite sua senha novamente"
                    className="h-12 w-full rounded-lg bg-zinc-100 px-4 text-sm text-zinc-950 outline-none transition-all placeholder:text-zinc-500 focus:bg-white focus:ring-1 focus:ring-zinc-950"
                />
            </div>

            {state.error && (
                <p
                    role="alert"
                    className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                    {state.error}
                </p>
            )}

            <button
                type="submit"
                disabled={pending}
                className="flex h-12 w-full items-center justify-center rounded-full bg-zinc-950 px-4 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
                {pending ? "Criando conta..." : "Criar conta"}
            </button>

            <p className="text-center text-sm text-zinc-500">
                Já tem uma conta?{" "}
                <Link
                    href="/login"
                    className="font-semibold text-zinc-950 hover:underline"
                >
                    Entrar
                </Link>
            </p>
        </form>
    );
}
