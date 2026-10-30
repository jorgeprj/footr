
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    Add01Icon,
    ArrowUpRight01Icon,
    ChartLineData01Icon,
    FileUploadIcon,
    Package01Icon,
    ShoppingCart01Icon,
} from "@hugeicons/core-free-icons";

const stats = [
    {
        label: "Receita total",
        value: "R$ 12.450,00",
        variation: "+12,5%",
        positive: true,
    },
    {
        label: "Vendas",
        value: "38",
        variation: "+8,2%",
        positive: true,
    },
    {
        label: "Produtos ativos",
        value: "124",
        variation: "No estoque",
        positive: null,
    },
    {
        label: "Ticket médio",
        value: "R$ 327,63",
        variation: "Por venda",
        positive: null,
    },
];

const salesChart = [
    { day: "Seg", value: 850, height: 27 },
    { day: "Ter", value: 1240, height: 39 },
    { day: "Qua", value: 680, height: 21 },
    { day: "Qui", value: 1750, height: 55 },
    { day: "Sex", value: 2100, height: 66 },
    { day: "Sáb", value: 3200, height: 100 },
    { day: "Dom", value: 1450, height: 45 },
];

const recentSales = [
    {
        code: "FTR-000124",
        product: "Flamengo Home 2023",
        date: "Hoje, 11:42",
        payment: "Pix",
        value: "R$ 249,90",
    },
    {
        code: "FTR-000121",
        product: "Barcelona Away 2018/19",
        date: "Hoje, 10:18",
        payment: "Crédito",
        value: "R$ 319,90",
    },
    {
        code: "FTR-000118",
        product: "Brasil Home 2002",
        date: "Ontem, 18:35",
        payment: "Dinheiro",
        value: "R$ 499,90",
    },
    {
        code: "FTR-000115",
        product: "Manchester United Home 2007",
        date: "Ontem, 15:20",
        payment: "Débito",
        value: "R$ 289,90",
    },
];

const quickActions = [
    {
        label: "Adicionar produto",
        description: "Cadastre uma nova camisa",
        href: "/products",
        icon: Add01Icon,
    },
    {
        label: "Abrir PDV",
        description: "Registrar uma nova venda",
        href: "/pos",
        icon: ShoppingCart01Icon,
    },
    {
        label: "Importar estoque",
        description: "Importe produtos por planilha",
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

export default function DashboardPage() {
    return (
        <main className="min-w-0">
            {/* Page header */}
            <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
                        Visão geral
                    </h1>
                    <p className="mt-1 text-sm text-zinc-500">
                        Acompanhe o desempenho da sua loja.
                    </p>
                </div>

                <div className="flex h-10 w-fit items-center gap-2 rounded-lg bg-zinc-100 px-3 text-sm text-zinc-700">
                    <span>Últimos 7 dias</span>
                </div>
            </div>

            {/* Main layout */}
            <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_260px]">
                {/* Main column */}
                <div className="min-w-0 space-y-8">
                    {/* Statistics */}
                    <section>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-7 lg:grid-cols-4">
                            {stats.map((stat) => (
                                <div key={stat.label} className="min-w-0">
                                    <p className="text-sm text-zinc-500">
                                        {stat.label}
                                    </p>

                                    <p className="mt-2 truncate text-2xl font-semibold tracking-tight text-zinc-950">
                                        {stat.value}
                                    </p>

                                    {stat.positive === true ? (
                                        <p className="mt-2 text-xs font-medium text-emerald-700">
                                            {stat.variation} no período
                                        </p>
                                    ) : (
                                        <p className="mt-2 text-xs text-zinc-400">
                                            {stat.variation}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Sales chart */}
                    <section className="border-t border-zinc-100 pt-7">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h2 className="text-base font-semibold text-zinc-950">
                                    Desempenho de vendas
                                </h2>
                                <p className="mt-1 text-xs text-zinc-500">
                                    Receita dos últimos 7 dias
                                </p>
                            </div>

                            <span className="text-sm font-medium text-zinc-950">
                                R$ 11.270,00
                            </span>
                        </div>

                        <div className="flex h-48 items-end gap-3 sm:gap-5">
                            {salesChart.map((item) => (
                                <div
                                    key={item.day}
                                    className="flex h-full flex-1 flex-col items-center justify-end gap-3"
                                >
                                    <div className="flex w-full flex-1 items-end">
                                        <div
                                            className="w-full rounded-t-sm bg-zinc-900 transition-colors hover:bg-zinc-700"
                                            style={{
                                                height: `${item.height}%`,
                                            }}
                                            title={`R$ ${item.value.toLocaleString("pt-BR")}`}
                                        />
                                    </div>

                                    <span className="text-xs text-zinc-400">
                                        {item.day}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Recent sales */}
                    <section className="border-t border-zinc-100 pt-7">
                        <div className="mb-5 flex items-center justify-between">
                            <div>
                                <h2 className="text-base font-semibold text-zinc-950">
                                    Vendas recentes
                                </h2>
                                <p className="mt-1 text-xs text-zinc-500">
                                    Últimas transações da sua loja
                                </p>
                            </div>

                            <Link
                                href="/sales"
                                className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-950"
                            >
                                Ver todas
                            </Link>
                        </div>

                        <div className="divide-y divide-zinc-100">
                            {recentSales.map((sale) => (
                                <div
                                    key={sale.code}
                                    className="flex items-center justify-between gap-4 py-4"
                                >
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium text-zinc-950">
                                            {sale.product}
                                        </p>

                                        <p className="mt-1 text-xs text-zinc-400">
                                            {sale.code} · {sale.date}
                                        </p>
                                    </div>

                                    <div className="shrink-0 text-right">
                                        <p className="text-sm font-semibold text-zinc-950">
                                            {sale.value}
                                        </p>

                                        <p className="mt-1 text-xs text-zinc-400">
                                            {sale.payment}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Quick actions column */}
                <aside className="border-t border-zinc-100 pt-7 xl:border-l xl:border-t-0 xl:pl-6 xl:pt-0">
                    <div className="mb-5">
                        <h2 className="text-base font-semibold text-zinc-950">
                            Ações rápidas
                        </h2>
                        <p className="mt-1 text-xs text-zinc-500">
                            Acesse as principais funcionalidades.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-1">
                        {quickActions.map((action) => (
                            <Link
                                key={action.label}
                                href={action.href}
                                className="group flex items-center gap-3 rounded-lg py-3 transition-colors hover:bg-zinc-50 xl:px-2"
                            >
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700 transition-colors group-hover:bg-zinc-200">
                                    <HugeiconsIcon
                                        icon={action.icon}
                                        size={20}
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
                                    className="shrink-0 text-zinc-400 transition-colors group-hover:text-zinc-950"
                                />
                            </Link>
                        ))}
                    </div>

                    {/* Stock overview */}
                    <div className="mt-8 border-t border-zinc-100 pt-6">
                        <div className="mb-4 flex items-center gap-2">
                            <HugeiconsIcon
                                icon={Package01Icon}
                                size={19}
                                className="text-zinc-500"
                            />

                            <h3 className="text-sm font-semibold text-zinc-950">
                                Estoque
                            </h3>
                        </div>

                        <p className="text-3xl font-semibold tracking-tight text-zinc-950">
                            124
                        </p>

                        <p className="mt-1 text-xs text-zinc-500">
                            Produtos disponíveis
                        </p>

                        <Link
                            href="/products"
                            className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-zinc-700 transition-colors hover:text-zinc-950"
                        >
                            Gerenciar estoque
                            <HugeiconsIcon
                                icon={ArrowUpRight01Icon}
                                size={14}
                            />
                        </Link>
                    </div>
                </aside>
            </div>
        </main>
    );
}
