
"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
    signInAction,
    type AuthActionState,
} from "@/app/actions/auth";

const initialState: AuthActionState = {};

export function LoginForm() {
    const [state, formAction, pending] = useActionState(
        signInAction,
        initialState,
    );

    return (
        <form action={formAction} className="space-y-6">
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
                    autoComplete="current-password"
                    required
                    placeholder="Sua senha"
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
                {pending ? "Entrando..." : "Entrar"}
            </button>

            <p className="text-center text-sm text-zinc-500">
                Ainda não tem uma conta?{" "}
                <Link
                    href="/signup"
                    className="font-semibold text-zinc-950 hover:underline"
                >
                    Criar conta
                </Link>
            </p>
        </form>
    );
}
