
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    Add01Icon,
    ArrowUpRight01Icon,
    FileUploadIcon,
    Package01Icon,
    ShoppingCart01Icon,
    ChartLineData01Icon,
} from "@hugeicons/core-free-icons";

import { getDashboardSummary } from "@/features/dashboard/get-dashboard-summary";

import type { DashboardSummary } from "@/modules/dashboard/domain/dashboard-summary";

type Period = {
    startDate: string;
    endDate: string;
};

const CURRENCY_FORMATTER = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
});

function formatCurrency(value: number): string {
    return CURRENCY_FORMATTER.format(value);
}

function getLocalDateString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function getInitialPeriod(): Period {
    const end = new Date();
    const start = new Date();

    start.setDate(start.getDate() - 6);

    return {
        startDate: getLocalDateString(start),
        endDate: getLocalDateString(end),
    };
}

const QUICK_ACTIONS = [
    {
        label: "Adicionar produto",
        description: "Cadastre uma camisa",
        href: "/products",
        icon: Add01Icon,
    },
    {
        label: "Abrir PDV",
        description: "Registrar uma venda",
        href: "/pos",
        icon: ShoppingCart01Icon,
    },
    {
        label: "Importar estoque",
        description: "Importe uma planilha",
        href: "/products",
        icon: FileUploadIcon,
    },
    {
        label: "Ver financeiro",
        description: "Acompanhe seus resultados",
        href: "/finance",
        icon: ChartLineData01Icon,
    },
];

function DashboardSkeleton() {
    return (
        <main className="animate-pulse space-y-10">
            <div className="flex justify-between gap-4">
                <div className="space-y-2">
                    <div className="h-7 w-40 rounded bg-zinc-100" />
                    <div className="h-4 w-64 rounded bg-zinc-100" />
                </div>
                <div className="h-10 w-64 rounded-lg bg-zinc-100" />
            </div>

            <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="space-y-3">
                        <div className="h-4 w-28 rounded bg-zinc-100" />
                        <div className="h-8 w-36 rounded bg-zinc-100" />
                    </div>
                ))}
            </div>

            <div className="h-52 rounded-lg bg-zinc-100" />
        </main>
    );
}

export function DashboardView() {
    const [period, setPeriod] = useState<Period>(getInitialPeriod);
    const [appliedPeriod, setAppliedPeriod] = useState<Period>(getInitialPeriod);
    const [summary, setSummary] = useState<DashboardSummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        let isActive = true;

        async function loadDashboard() {
            setIsLoading(true);
            setError(null);

            try {
                const result = await getDashboardSummary(appliedPeriod);

                if (!isActive) return;

                if (!result.success) {
                    setSummary(null);
                    setError(result.error);
                    return;
                }

                setSummary(result.data);
            } catch {
                if (!isActive) return;

                setSummary(null);
                setError("Não foi possível carregar o dashboard.");
            } finally {
                if (isActive) setIsLoading(false);
            }
        }

        void loadDashboard();

        return () => {
            isActive = false;
        };
    }, [appliedPeriod, refreshKey]);

    function handleApplyPeriod() {
        if (!period.startDate || !period.endDate) {
            setError("Selecione as duas datas do período.");
            return;
        }

        if (period.startDate > period.endDate) {
            setError("A data inicial deve ser anterior à data final.");
            return;
        }

        setAppliedPeriod({ ...period });
    }

    function handlePreset(days: number) {
        const end = new Date();
        const start = new Date();

        start.setDate(start.getDate() - (days - 1));

        const nextPeriod = {
            startDate: getLocalDateString(start),
            endDate: getLocalDateString(end),
        };

        setPeriod(nextPeriod);
        setAppliedPeriod(nextPeriod);
    }

    if (isLoading && !summary && !error) {
        return <DashboardSkeleton />;
    }

    return (
        <main className="min-w-0 space-y-10">
            <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
                        Visão geral
                    </h1>
                    <p className="mt-1 text-sm text-zinc-500">
                        O resumo da sua loja em um só lugar.
                    </p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-2">
                        <input
                            aria-label="Data inicial"
                            type="date"
                            value={period.startDate}
                            max={period.endDate || undefined}
                            onChange={(event) =>
                                setPeriod((current) => ({
                                    ...current,
                                    startDate: event.target.value,
                                }))
                            }
                            className="h-10 min-w-0 rounded-lg bg-zinc-100 px-3 text-xs text-zinc-700 outline-none focus:ring-1 focus:ring-zinc-400"
                        />

                        <span className="text-xs text-zinc-400">até</span>

                        <input
                            aria-label="Data final"
                            type="date"
                            value={period.endDate}
                            min={period.startDate || undefined}
                            onChange={(event) =>
                                setPeriod((current) => ({
                                    ...current,
                                    endDate: event.target.value,
                                }))
                            }
                            className="h-10 min-w-0 rounded-lg bg-zinc-100 px-3 text-xs text-zinc-700 outline-none focus:ring-1 focus:ring-zinc-400"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={handleApplyPeriod}
                        disabled={isLoading}
                        className="h-10 rounded-lg bg-zinc-950 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50"
                    >
                        Aplicar período
                    </button>
                </div>
            </header>

            <div className="flex flex-wrap gap-2">
                {[
                    { label: "7 dias", days: 7 },
                    { label: "30 dias", days: 30 },
                    { label: "90 dias", days: 90 },
                ].map((preset) => (
                    <button
                        key={preset.days}
                        type="button"
                        onClick={() => handlePreset(preset.days)}
                        className="rounded-md bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-200"
                    >
                        {preset.label}
                    </button>
                ))}
            </div>

            {error && (
                <section
                    role="alert"
                    className="flex flex-col gap-3 border-l-2 border-red-500 py-2 pl-4 sm:flex-row sm:items-center sm:justify-between"
                >
                    <p className="text-sm text-zinc-600">{error}</p>

                    <button
                        type="button"
                        onClick={() => setRefreshKey((current) => current + 1)}
                        className="text-sm font-medium text-zinc-800 hover:text-zinc-500"
                    >
                        Tentar novamente
                    </button>
                </section>
            )}

            {isLoading && summary && (
                <p className="text-xs text-zinc-400">
                    Atualizando indicadores...
                </p>
            )}

            {summary && (
                <>
                    <section className="grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-4">
                        {[
                            {
                                label: "Receita total",
                                value: formatCurrency(summary.revenue),
                            },
                            {
                                label: "Vendas realizadas",
                                value: summary.salesCount.toLocaleString("pt-BR"),
                            },
                            {
                                label: "Ticket médio",
                                value: formatCurrency(summary.averageTicket),
                            },
                            {
                                label: "Estoque disponível",
                                value: summary.availableProductsCount.toLocaleString("pt-BR"),
                            },
                        ].map((stat) => (
                            <div key={stat.label} className="min-w-0">
                                <p className="text-sm text-zinc-500">
                                    {stat.label}
                                </p>
                                <p className="mt-2 truncate text-2xl font-semibold tracking-tight text-zinc-950">
                                    {stat.value}
                                </p>
                            </div>
                        ))}
                    </section>

                    {summary.isLowStock && (
                        <div className="flex items-center justify-between gap-4 rounded-lg bg-zinc-100 px-4 py-3">
                            <div className="flex items-center gap-3">
                                <HugeiconsIcon
                                    icon={Package01Icon}
                                    size={20}
                                    className="shrink-0 text-zinc-600"
                                />
                                <p className="text-sm text-zinc-700">
                                    Seu estoque está abaixo de 100 camisas.
                                </p>
                            </div>

                            <Link
                                href="/products"
                                className="shrink-0 text-sm font-medium text-zinc-900 hover:text-zinc-500"
                            >
                                Ver estoque
                            </Link>
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-10 border-t border-zinc-100 pt-8 lg:grid-cols-[minmax(0,1fr)_320px]">
                        <section className="min-w-0">
                            <div className="mb-5">
                                <h2 className="text-base font-semibold text-zinc-950">
                                    Produtos mais vendidos
                                </h2>
                            </div>

                            {summary.topSellingProducts.length === 0 ? (
                                <p className="py-6 text-sm text-zinc-400">
                                    Nenhuma venda registrada neste período.
                                </p>
                            ) : (
                                <div className="divide-y divide-zinc-100">
                                    {summary.topSellingProducts.map(
                                        (product, index) => (
                                            <div
                                                key={`${product.description}-${index}`}
                                                className="flex items-center gap-4 py-4"
                                            >
                                                <span className="w-6 text-sm tabular-nums text-zinc-400">
                                                    {String(index + 1).padStart(2, "0")}
                                                </span>

                                                <p className="min-w-0 flex-1 truncate text-sm font-medium text-zinc-900">
                                                    {product.description}
                                                </p>

                                                <span className="shrink-0 text-sm text-zinc-500">
                                                    {product.quantitySold}{" "}
                                                    {product.quantitySold === 1
                                                        ? "venda"
                                                        : "vendas"}
                                                </span>
                                            </div>
                                        ),
                                    )}
                                </div>
                            )}
                        </section>

                        <aside className="border-t border-zinc-100 pt-7 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                            <h2 className="mb-4 text-base font-semibold text-zinc-950">
                                Acesso rápido
                            </h2>

                            <div className="space-y-1">
                                {QUICK_ACTIONS.map((action) => (
                                    <Link
                                        key={action.label}
                                        href={action.href}
                                        className="group flex items-center gap-3 rounded-lg py-3 transition-colors hover:bg-zinc-50"
                                    >
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700 group-hover:bg-zinc-200">
                                            <HugeiconsIcon
                                                icon={action.icon}
                                                size={19}
                                                strokeWidth={1.8}
                                            />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-zinc-900">
                                                {action.label}
                                            </p>
                                            <p className="mt-1 text-xs text-zinc-500">
                                                {action.description}
                                            </p>
                                        </div>

                                        <HugeiconsIcon
                                            icon={ArrowUpRight01Icon}
                                            size={16}
                                            className="shrink-0 text-zinc-400"
                                        />
                                    </Link>
                                ))}
                            </div>
                        </aside>
                    </div>
                </>
            )}

            {!summary && !isLoading && !error && (
                <p className="py-12 text-center text-sm text-zinc-400">
                    Nenhum dado disponível para exibir.
                </p>
            )}

            <footer className="border-t border-zinc-100 pt-6">
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                    <div>
                        <p className="text-sm font-semibold text-zinc-900">
                            Footr <span className="font-normal text-zinc-500">Alfa 0.1</span>
                        </p>
                        <p className="mt-1 text-xs text-zinc-500">
                            Estamos construindo o futuro da gestão de camisas de futebol.
                        </p>
                    </div>

                    <span className="w-fit rounded-md bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-600">
                        Versão em desenvolvimento
                    </span>
                </div>
            </footer>
        </main>
    );
}
