'use client'
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    ArrowLeft01Icon,
    Home01Icon,
} from "@hugeicons/core-free-icons";

export default function NotFound() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-white px-6 py-12">
            <div className="w-full max-w-md text-center">
                <Link
                    href="/login"
                    className="font-logo text-4xl italic tracking-[-0.07em] text-zinc-950"
                >
                    Footr
                </Link>

                <div className="mt-20">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400">
                        Erro 404
                    </p>

                    <h1 className="mt-5 text-7xl font-semibold tracking-[-0.08em] text-zinc-950 sm:text-8xl">
                        404
                    </h1>

                    <h2 className="mt-6 text-xl font-semibold tracking-tight text-zinc-950">
                        Parece que essa página saiu de campo.
                    </h2>

                    <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-zinc-500">
                        Não encontramos o endereço que você está procurando.
                        Talvez ele tenha sido movido ou não exista mais.
                    </p>

                    <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                        <Link
                            href="/dashboard"
                            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-zinc-950 px-6 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 sm:w-auto"
                        >
                            <HugeiconsIcon
                                icon={Home01Icon}
                                size={18}
                            />
                            Voltar ao painel
                        </Link>

                        <button
                            type="button"
                            onClick={() => window.history.back()}
                            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-950 sm:w-auto"
                        >
                            <HugeiconsIcon
                                icon={ArrowLeft01Icon}
                                size={18}
                            />
                            Voltar
                        </button>
                    </div>
                </div>

                <footer className="mt-24">
                    <p className="text-[10px] font-medium tracking-[0.16em] text-zinc-400">
                        FOOTR · GESTÃO PARA LOJAS DE CAMISAS DE FUTEBOL
                    </p>
                </footer>
            </div>
        </main>
    );
}
