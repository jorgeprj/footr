
"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import ArrowLeft01Icon from "@hugeicons/core-free-icons/ArrowLeft01Icon";
import Calendar03Icon from "@hugeicons/core-free-icons/Calendar03Icon";
import type {
    Sale,
    SaleDetails,
    SaleItem,
} from "@/modules/sales/domain/sale";

interface SalesDetailsProps {
    sale: SaleDetails;
    onBack: () => void;
}

const paymentLabels: Record<Sale["paymentMethod"], string> = {
    installment: "Parcelado",
    credit: "Crédito",
    debit: "Débito",
    pix: "Pix",
    cash: "Dinheiro",
};

const statusLabels: Record<Sale["status"], string> = {
    pending: "Pendente",
    completed: "Concluída",
    cancelled: "Cancelada",
    refunded: "Reembolsada",
};

const statusColors: Record<Sale["status"], string> = {
    pending: "bg-orange-500",
    completed: "bg-green-500",
    cancelled: "bg-zinc-400",
    refunded: "bg-purple-500",
};

function formatPrice(value: number) {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(value);
}

function formatFullDate(value: string) {
    return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(value));
}

function ShirtPlaceholder() {
    return (
        <div className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-zinc-100">
            <svg
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="size-9 text-zinc-400"
                aria-hidden="true"
            >
                <path
                    d="M15 8L7 12L3 22L11 26L15 20V40H33V20L37 26L41 12L33 8C31 11 28 13 24 13C20 13 17 11 15 8Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                />
            </svg>
        </div>
    );
}

function PaymentBadge({ method }: { method: Sale["paymentMethod"] }) {
    return (
        <span className="inline-flex items-center rounded-md bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-700">
            {paymentLabels[method]}
        </span>
    );
}

function SaleStatus({ status }: { status: Sale["status"] }) {
    return (
        <span className="inline-flex items-center gap-2 text-xs font-medium text-zinc-700">
            <span className={`size-2 rounded-full ${statusColors[status]}`} />
            {statusLabels[status]}
        </span>
    );
}

function ProductRow({ item }: { item: SaleItem }) {
    return (
        <div className="flex flex-col justify-between gap-4 py-5 sm:flex-row sm:items-center">
            <div className="flex min-w-0 items-center gap-4">
                <ShirtPlaceholder />

                <div className="min-w-0">
                    <h3 className="font-semibold text-zinc-950">
                        {item.teamName} {item.season}
                    </h3>

                    <p className="mt-1 text-sm text-zinc-500">
                        {item.type} · {item.version} · Tamanho {item.size}
                    </p>

                    <p className="mt-2 font-mono text-[11px] text-zinc-400">
                        {item.productCode}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-8 pl-20 sm:pl-0">
                <div>
                    <p className="text-xs text-zinc-400">Custo</p>
                    <p className="mt-1 text-sm tabular-nums text-zinc-600">
                        {formatPrice(item.unitCost)}
                    </p>
                </div>

                <div className="min-w-24 text-right">
                    <p className="text-xs text-zinc-400">Preço de venda</p>
                    <p className="mt-1 text-sm font-semibold tabular-nums text-zinc-950">
                        {formatPrice(item.unitPrice)}
                    </p>
                </div>
            </div>
        </div>
    );
}

function FinancialRow({
    label,
    value,
    muted = false,
}: {
    label: string;
    value: string;
    muted?: boolean;
}) {
    return (
        <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-zinc-500">{label}</span>
            <span
                className={`text-sm tabular-nums ${
                    muted ? "text-zinc-500" : "font-medium text-zinc-900"
                }`}
            >
                {value}
            </span>
        </div>
    );
}

export function SalesDetails({ sale, onBack }: SalesDetailsProps) {
    const totalCost = sale.items.reduce(
        (total, item) => total + item.unitCost,
        0,
    );

    const grossProfit = sale.totalAmount - totalCost;

    const profitPercentage =
        sale.totalAmount > 0
            ? (grossProfit / sale.totalAmount) * 100
            : 0;

    return (
        <main className="mx-auto max-w-6xl space-y-8">
            <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-zinc-950"
            >
                <HugeiconsIcon
                    icon={ArrowLeft01Icon}
                    size={18}
                    strokeWidth={1.8}
                />
                Voltar para vendas
            </button>

            <header className="flex flex-col justify-between gap-6 border-b border-zinc-200 pb-7 sm:flex-row sm:items-end">
                <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
                            Venda #{sale.saleNumber}
                        </h1>

                        <SaleStatus status={sale.status} />
                    </div>

                    <div className="flex items-center gap-2 text-sm text-zinc-500">
                        <HugeiconsIcon
                            icon={Calendar03Icon}
                            size={16}
                            strokeWidth={1.8}
                        />
                        {formatFullDate(sale.soldAt)}
                    </div>
                </div>

                <div className="sm:text-right">
                    <p className="text-xs font-medium text-zinc-400">
                        VALOR TOTAL
                    </p>
                    <p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums text-zinc-950">
                        {formatPrice(sale.totalAmount)}
                    </p>
                </div>
            </header>

            <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
                <div className="min-w-0 space-y-8">
                    <section>
                        <div className="mb-2 flex items-center justify-between">
                            <h2 className="text-base font-semibold text-zinc-950">
                                Produtos
                            </h2>

                            <span className="text-xs text-zinc-500">
                                {sale.items.length}{" "}
                                {sale.items.length === 1
                                    ? "item"
                                    : "itens"}
                            </span>
                        </div>

                        <div className="divide-y divide-zinc-100 border-y border-zinc-200">
                            {sale.items.map((item) => (
                                <ProductRow key={item.id} item={item} />
                            ))}
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-base font-semibold text-zinc-950">
                            Informações da venda
                        </h2>

                        <div className="grid gap-6 sm:grid-cols-2">
                            <div>
                                <p className="text-xs text-zinc-400">
                                    Cliente
                                </p>
                                <p className="mt-1 text-sm font-medium text-zinc-950">
                                    {sale.customerName || "Não informado"}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-zinc-400">
                                    Forma de pagamento
                                </p>
                                <div className="mt-2">
                                    <PaymentBadge
                                        method={sale.paymentMethod}
                                    />
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                <aside className="h-fit space-y-5 lg:sticky lg:top-6">
                    <h2 className="text-base font-semibold text-zinc-950">
                        Resumo financeiro
                    </h2>

                    <div className="space-y-4">
                        <FinancialRow
                            label="Subtotal"
                            value={formatPrice(sale.subtotal)}
                        />

                        <FinancialRow
                            label="Desconto"
                            value={`- ${formatPrice(sale.discountAmount)}`}
                            muted
                        />

                        <div className="border-t border-zinc-200 pt-4">
                            <FinancialRow
                                label="Total da venda"
                                value={formatPrice(sale.totalAmount)}
                            />
                        </div>
                    </div>

                    <div className="space-y-4 border-t border-zinc-200 pt-5">
                        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                            Resultado da venda
                        </p>

                        <div>
                            <p className="text-xs text-zinc-500">
                                Custo dos produtos
                            </p>
                            <p className="mt-1 text-sm font-medium tabular-nums text-zinc-900">
                                {formatPrice(totalCost)}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-zinc-500">
                                Margem bruta
                            </p>

                            <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums text-zinc-950">
                                {formatPrice(grossProfit)}
                            </p>

                            <p className="mt-1 text-xs text-zinc-400">
                                {profitPercentage.toFixed(1).replace(".", ",")}% do valor da venda
                            </p>
                        </div>
                    </div>
                </aside>
            </div>
        </main>
    );
}
