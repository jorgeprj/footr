
import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";

import { createSupabaseStoreGateway } from "@/modules/stores/adapters/supabase/supabase-store-gateway";
import { StoreForm } from "./store-form";

function SetupStoreSkeleton() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-white px-5 py-12">
            <div className="w-full max-w-100 animate-pulse">
                <header className="mb-10 text-center">
                    <div className="mx-auto h-12 w-28 rounded bg-zinc-100" />
                    <div className="mx-auto mt-4 h-4 w-64 max-w-full rounded bg-zinc-100" />
                </header>

                <section>
                    <div className="mb-8">
                        <div className="h-7 w-40 rounded bg-zinc-100" />
                        <div className="mt-3 h-4 w-full rounded bg-zinc-100" />
                        <div className="mt-2 h-4 w-3/4 rounded bg-zinc-100" />
                    </div>

                    <div className="h-4 w-28 rounded bg-zinc-100" />
                    <div className="mt-2 h-12 w-full rounded-lg bg-zinc-100" />
                    <div className="mt-2 h-3 w-3/4 rounded bg-zinc-100" />

                    <div className="mt-8 h-12 w-full rounded-full bg-zinc-100" />
                </section>
            </div>
        </main>
    );
}

async function SetupStoreContent() {
    await connection();

    const storeGateway = createSupabaseStoreGateway();
    const store = await storeGateway.getCurrentUserStore();

    if (store) {
        redirect("/dashboard");
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-white px-5 py-12">
            <div className="w-full max-w-100">
                <header className="mb-10 text-center">
                    <h1 className="font-logo text-5xl italic tracking-[-0.07em] text-zinc-950">
                        Footr
                    </h1>

                    <p className="mt-4 text-sm text-zinc-500">
                        Gestão inteligente para lojas de camisas de futebol.
                    </p>
                </header>

                <section>
                    <div className="mb-8">
                        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
                            Configuração inicial · 01
                        </p>

                        <h2 className="text-2xl font-semibold tracking-tight text-zinc-950">
                            Vamos criar sua loja.
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-zinc-500">
                            Sua conta está pronta. Agora, informe o nome da sua loja
                            para começar a organizar seus produtos e vendas.
                        </p>
                    </div>

                    <StoreForm />
                </section>

                <footer className="mt-12 text-center">
                    <p className="text-[10px] font-medium tracking-[0.16em] text-zinc-400">
                        FOOTR · GESTÃO PARA LOJAS DE CAMISAS DE FUTEBOL
                    </p>
                </footer>
            </div>
        </main>
    );
}

export default function SetupStorePage() {
    return (
        <Suspense fallback={<SetupStoreSkeleton />}>
            <SetupStoreContent />
        </Suspense>
    );
}
