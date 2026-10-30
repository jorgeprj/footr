import type {
    ServiceHealth,
    SystemHealth,
} from "@/modules/system/ports/system-status-gateway";

import Link from "next/link";

interface StatusPageProps {
    health: SystemHealth;
}

function getServiceLabel(status: ServiceHealth["status"]) {
    switch (status) {
        case "operational":
            return "Operacional";
        case "restricted":
            return "Acesso restrito";
        case "unavailable":
            return "Indisponível";
    }
}

function ServiceRow({
    name,
    description,
    health,
}: {
    name: string;
    description: string;
    health: ServiceHealth;
}) {
    const operational = health.status === "operational";
    const restricted = health.status === "restricted";

    const statusColor = operational
        ? "text-emerald-700"
        : restricted
            ? "text-amber-700"
            : "text-red-700";

    const dotColor = operational
        ? "bg-emerald-500"
        : restricted
            ? "bg-amber-500"
            : "bg-red-500";

    return (
        <div className="flex items-center justify-between gap-4 py-6">
            <div>
                <h2 className="text-sm font-semibold text-zinc-950">
                    {name}
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                    {description}
                </p>

                {health.responseTime !== null && (
                    <p className="mt-2 font-mono text-xs text-zinc-400">
                        Resposta: {health.responseTime} ms
                    </p>
                )}
            </div>

            <div className="flex shrink-0 items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${dotColor}`} />

                <span className={`text-sm font-medium ${statusColor}`}>
                    {getServiceLabel(health.status)}
                </span>
            </div>
        </div>
    );
}

export function StatusPage({ health }: StatusPageProps) {
    const allOperational =
        health.database.status === "operational" &&
        health.authentication.status === "operational";

    const allUnavailable =
        health.database.status === "unavailable" &&
        health.authentication.status === "unavailable";

    const overallStatus = allOperational
        ? "Todos os sistemas operacionais"
        : allUnavailable
            ? "Sistemas indisponíveis"
            : "Instabilidade identificada";

    const overallColor = allOperational
        ? "text-emerald-700"
        : allUnavailable
            ? "text-red-700"
            : "text-amber-700";

    const checkedAt = new Date(health.checkedAt).toLocaleString("pt-BR", {
        dateStyle: "short",
        timeStyle: "medium",
    });

    return (
        <main className="flex min-h-screen flex-col bg-white px-6 py-12">
            <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col">
                <header className="flex items-center justify-between">
                    <Link
                        href="/login"
                        className="font-logo text-3xl italic tracking-[-0.07em] text-zinc-950"
                    >
                        Footr
                    </Link>

                    <span className="text-xs font-medium uppercase tracking-widest text-zinc-400">
                        System Status
                    </span>
                </header>

                <section className="mt-24">
                    <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
                        Status da plataforma
                    </p>

                    <h1 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-950">
                        Tudo sobre a disponibilidade da Footr.
                    </h1>

                    <div className="mt-8 flex items-center gap-3">
                        <span
                            className={`h-2.5 w-2.5 rounded-full ${allOperational
                                    ? "bg-emerald-500"
                                    : allUnavailable
                                        ? "bg-red-500"
                                        : "bg-amber-500"
                                }`}
                        />

                        <p className={`text-sm font-semibold ${overallColor}`}>
                            {overallStatus}
                        </p>
                    </div>
                </section>

                <section className="mt-14">
                    <div className="border-b border-zinc-200 pb-3">
                        <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
                            Serviços
                        </h2>
                    </div>

                    <ServiceRow
                        name="Banco de dados"
                        description="Conexão com Database"
                        health={health.database}
                    />

                    <div className="border-t border-zinc-100">
                        <ServiceRow
                            name="Autenticação"
                            description="Serviço de autenticação"
                            health={health.authentication}
                        />
                    </div>
                </section>

                <section className="mt-8 flex flex-col gap-4 border-t border-zinc-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-xs text-zinc-400">
                            Última verificação
                        </p>

                        <p className="mt-1 font-mono text-xs text-zinc-600">
                            {checkedAt}
                        </p>
                    </div>

                    <Link
                        href="/status"
                        className="inline-flex h-10 items-center justify-center rounded-full bg-zinc-950 px-5 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
                    >
                        Verificar novamente
                    </Link>
                </section>

                <footer className="mt-auto pt-24">
                    <p className="text-[10px] font-medium tracking-[0.16em] text-zinc-400">
                        FOOTR · GESTÃO PARA LOJAS DE CAMISAS DE FUTEBOL
                    </p>
                </footer>
            </div>
        </main>
    );
}
