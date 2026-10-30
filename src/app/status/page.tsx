
import { Suspense } from "react";
import { connection } from "next/server";

import { checkDatabaseHealth } from "@/modules/system/application/check-database-health";
import { SupabaseDatabaseHealthAdapter } from "@/modules/system/adapters/supabase/supabase-database-health.adapter";

type StatusRowProps = {
    label: string;
    ok: boolean | null;
};

function StatusRow({ label, ok }: StatusRowProps) {
    const status = {
        true: {
            label: "Funcionando",
            className: "text-green-700",
            dotClassName: "bg-green-600",
        },
        false: {
            label: "Indisponível",
            className: "text-red-600",
            dotClassName: "bg-red-500",
        },
        null: {
            label: "Verificando",
            className: "text-neutral-400",
            dotClassName: "bg-neutral-300",
        },
    }[String(ok) as "true" | "false" | "null"];

    return (
        <li className="flex items-center justify-between gap-4 py-4">
            <span className="text-sm text-neutral-700">{label}</span>

            <span
                className={`flex shrink-0 items-center gap-2 text-sm ${status.className}`}
            >
                <span
                    className={`h-2 w-2 rounded-full ${status.dotClassName}`}
                    aria-hidden="true"
                />
                {status.label}
            </span>
        </li>
    );
}

function StatusLoading() {
    return (
        <section className="mt-10">
            <div className="border-y border-neutral-200">
                {[
                    "Conexão com a plataforma",
                    "Cadastro de produtos",
                    "Registro de vendas",
                    "Histórico de vendas",
                    "Configurações da loja",
                ].map((label) => (
                    <StatusRow key={label} label={label} ok={null} />
                ))}
            </div>
        </section>
    );
}

async function StatusReport() {
    await connection();

    const configured =
        Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
        Boolean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

    let report = null;

    if (configured) {
        try {
            report = await checkDatabaseHealth(
                new SupabaseDatabaseHealthAdapter(),
            );
        } catch {
            report = null;
        }
    }

    const items = [
        {
            label: "Conexão com a plataforma",
            ok: report?.connection.ok ?? false,
        },
        {
            label: "Cadastro de produtos",
            ok: report?.tables.find((table) => table.name === "products")
                ?.result.ok ?? false,
        },
        {
            label: "Registro de vendas",
            ok: report?.tables.find((table) => table.name === "sales")
                ?.result.ok ?? false,
        },
        {
            label: "Histórico de vendas",
            ok: report?.tables.find((table) => table.name === "sale_items")
                ?.result.ok ?? false,
        },
        {
            label: "Configurações da loja",
            ok: report?.tables.find((table) => table.name === "stores")
                ?.result.ok ?? false,
        },
    ];

    const allOk = configured && report?.ok === true;

    return (
        <>
            <section className="mt-10 border-y border-neutral-200 py-6">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-neutral-500">
                    Status geral
                </p>

                <div className="mt-3 flex items-center gap-3">
                    <span
                        className={`h-2.5 w-2.5 rounded-full ${allOk ? "bg-green-600" : "bg-red-500"
                            }`}
                        aria-hidden="true"
                    />

                    <h2 className="text-lg font-semibold tracking-tight">
                        {allOk
                            ? "Tudo funcionando normalmente"
                            : "Alguns serviços estão indisponíveis"}
                    </h2>
                </div>

                <p className="mt-2 text-sm leading-6 text-neutral-500">
                    {allOk
                        ? "Os serviços essenciais do Footr estão respondendo normalmente."
                        : "Estamos com uma instabilidade em alguns serviços. Tente novamente em alguns instantes."}
                </p>
            </section>

            <section className="mt-8">
                <h2 className="text-sm font-semibold">Serviços da plataforma</h2>

                <ul className="mt-3 divide-y divide-neutral-200">
                    {items.map((item) => (
                        <StatusRow
                            key={item.label}
                            label={item.label}
                            ok={item.ok}
                        />
                    ))}
                </ul>
            </section>

            <p className="mt-8 text-xs leading-5 text-neutral-400">
                O status é atualizado ao carregar esta página.
            </p>
        </>
    );
}

export default function StatusPage() {
    return (
        <main className="min-h-screen bg-white px-6 py-10 text-neutral-950 md:px-10 md:py-14">
            <div className="mx-auto max-w-xl">
                <a
                    href="/"
                    aria-label="Footr — página inicial"
                    className="text-3xl font-black italic tracking-[-0.08em]"
                >
                    Footr
                </a>

                <header className="mt-16">
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">
                        Central de status
                    </p>

                    <h1 className="mt-3 text-4xl font-semibold tracking-tight">
                        Tudo em ordem?
                    </h1>

                    <p className="mt-3 text-sm leading-6 text-neutral-500">
                        Acompanhe o funcionamento dos serviços do Footr.
                    </p>
                </header>

                <Suspense fallback={<StatusLoading />}>
                    <StatusReport />
                </Suspense>

                <footer className="mt-16 border-t border-neutral-200 pt-5">
                    <p className="text-sm text-neutral-500">
                        Precisa de ajuda? Entre em contato com o suporte do Footr.
                    </p>
                </footer>
            </div>
        </main>
    );
}
