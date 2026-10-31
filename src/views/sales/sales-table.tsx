"use client";

import { useMemo, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import Search01Icon from "@hugeicons/core-free-icons/Search01Icon";
import ShoppingBag01Icon from "@hugeicons/core-free-icons/ShoppingBag01Icon";
import ArrowRight01Icon from "@hugeicons/core-free-icons/ArrowRight01Icon";
import Calendar03Icon from "@hugeicons/core-free-icons/Calendar03Icon";
import type { Sale } from "@/modules/sales/domain/sale";

interface SalesTableProps {
    sales: Sale[];
    onSelectSale: (saleId: string) => void;
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

function ShirtPlaceholder({ extraCount = 0 }: { extraCount?: number }) {
    return (
        <div className="relative flex size-14 shrink-0 items-center justify-center rounded-lg bg-zinc-100">
            <svg
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="size-8 text-zinc-400"
                aria-hidden="true"
            >
                <path
                    d="M15 8L7 12L3 22L11 26L15 20V40H33V20L37 26L41 12L33 8C31 11 28 13 24 13C20 13 17 11 15 8Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                />
            </svg>

            {extraCount > 0 && (
                <span className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-zinc-950 text-[10px] font-semibold text-white">
                    +{extraCount}
                </span>
            )}
        </div>
    );
}

function PaymentBadge({ method }: { method: Sale["paymentMethod"] }) {
    return (
        <span className="inline-flex items-center rounded-md bg-zinc-100 px-2.5 py-1.5 text-xs font-medium text-zinc-700">
            {paymentLabels[method]}
        </span>
    );
}

function SaleStatus({ status }: { status: Sale["status"] }) {
    return (
        <span className="inline-flex items-center gap-2 whitespace-nowrap text-xs font-medium text-zinc-700">
            <span className={`size-2 rounded-full ${statusColors[status]}`} />
            {statusLabels[status]}
        </span>
    );
}

function formatPrice(value: number) {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(value);
}

function formatSaleDate(value: string) {
    const date = new Date(value);
    const now = new Date();

    const isSameDay = (first: Date, second: Date) =>
        first.getFullYear() === second.getFullYear() &&
        first.getMonth() === second.getMonth() &&
        first.getDate() === second.getDate();

    const time = new Intl.DateTimeFormat("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);

    if (isSameDay(date, now)) {
        return `Hoje · ${time}`;
    }

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    if (isSameDay(date, yesterday)) {
        return `Ontem · ${time}`;
    }

    return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
    }).format(date);
}

export function SalesTable({
    sales,
    onSelectSale,
}: SalesTableProps) {
    const [search, setSearch] = useState("");

    const filteredSales = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase();

        if (!normalizedSearch) return sales;

        return sales.filter((sale) => {
            const customerName = sale.customerName?.toLowerCase() ?? "";

            const matchesCustomer =
                customerName.includes(normalizedSearch);

            const matchesProduct = sale.itemsPreview.some((item) => {
                const searchableText = [
                    item.teamName,
                    item.season,
                    item.type,
                    item.version,
                    item.size,
                ]
                    .join(" ")
                    .toLowerCase();

                return searchableText.includes(normalizedSearch);
            });

            return matchesCustomer || matchesProduct;
        });
    }, [sales, search]);

    return (
        <div className="space-y-6">
            <div className="relative max-w-sm">
                <HugeiconsIcon
                    icon={Search01Icon}
                    size={18}
                    strokeWidth={1.8}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
                />

                <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Buscar por cliente ou camisa..."
                    className="h-11 w-full rounded-xl bg-zinc-100 pl-10 pr-4 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:bg-zinc-50 focus:ring-1 focus:ring-zinc-300"
                />
            </div>

            <div className="space-y-4">
                <p className="text-xs text-zinc-500">
                    {filteredSales.length}{" "}
                    {filteredSales.length === 1
                        ? "resultado"
                        : "resultados"}
                </p>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-225 text-left text-sm">
                        <thead>
                            <tr className="border-b border-zinc-200 text-xs text-zinc-500">
                                <th className="w-20 px-4 py-3 font-medium">
                                    Produto
                                </th>
                                <th className="px-4 py-3 font-medium">
                                    Camisa
                                </th>
                                <th className="px-4 py-3 font-medium">
                                    Pagamento
                                </th>
                                <th className="px-4 py-3 font-medium">
                                    Status
                                </th>
                                <th className="px-4 py-3 font-medium">
                                    Data
                                </th>
                                <th className="px-4 py-3 text-right font-medium">
                                    Total
                                </th>
                                <th className="w-12 px-4 py-3" />
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-zinc-100">
                            {filteredSales.map((sale) => {
                                const firstItem = sale.itemsPreview[0];
                                const extraCount = Math.max(
                                    sale.itemCount - 1,
                                    0,
                                );

                                return (
                                    <tr
                                        key={sale.id}
                                        tabIndex={0}
                                        role="button"
                                        aria-label={`Ver detalhes da venda ${sale.saleNumber}`}
                                        onClick={() =>
                                            onSelectSale(sale.id)
                                        }
                                        onKeyDown={(event) => {
                                            if (
                                                event.key === "Enter" ||
                                                event.key === " "
                                            ) {
                                                event.preventDefault();
                                                onSelectSale(sale.id);
                                            }
                                        }}
                                        className="cursor-pointer text-zinc-700 outline-none transition-colors hover:bg-zinc-50 focus-visible:bg-zinc-50"
                                    >
                                        <td className="px-4 py-3">
                                            <ShirtPlaceholder
                                                extraCount={extraCount}
                                            />
                                        </td>

                                        <td className="min-w-64 px-4 py-3">
                                            {firstItem ? (
                                                <>
                                                    <p className="font-medium text-zinc-950">
                                                        {firstItem.teamName}{" "}
                                                        {firstItem.season}
                                                    </p>

                                                    <p className="mt-1 text-xs text-zinc-500">
                                                        {firstItem.type} ·{" "}
                                                        {firstItem.version} ·
                                                        {" "}Tamanho{" "}
                                                        {firstItem.size}
                                                    </p>
                                                </>
                                            ) : (
                                                <p className="font-medium text-zinc-950">
                                                    {sale.itemCount}{" "}
                                                    {sale.itemCount === 1
                                                        ? "camisa"
                                                        : "camisas"}
                                                </p>
                                            )}

                                            {sale.customerName && (
                                                <p className="mt-1 text-xs text-zinc-400">
                                                    {sale.customerName}
                                                </p>
                                            )}
                                        </td>

                                        <td className="whitespace-nowrap px-4 py-3">
                                            <PaymentBadge
                                                method={sale.paymentMethod}
                                            />
                                        </td>

                                        <td className="whitespace-nowrap px-4 py-3">
                                            <SaleStatus
                                                status={sale.status}
                                            />
                                        </td>

                                        <td className="whitespace-nowrap px-4 py-3">
                                            <div className="flex items-center gap-2 text-xs text-zinc-600">
                                                <HugeiconsIcon
                                                    icon={Calendar03Icon}
                                                    size={16}
                                                    strokeWidth={1.8}
                                                    className="text-zinc-400"
                                                />
                                                {formatSaleDate(sale.soldAt)}
                                            </div>
                                        </td>

                                        <td className="whitespace-nowrap px-4 py-3 text-right font-semibold tabular-nums text-zinc-950">
                                            {formatPrice(sale.totalAmount)}
                                        </td>

                                        <td className="px-4 py-3 text-right">
                                            <HugeiconsIcon
                                                icon={ArrowRight01Icon}
                                                size={18}
                                                strokeWidth={1.8}
                                                className="text-zinc-400"
                                            />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {filteredSales.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <HugeiconsIcon
                            icon={ShoppingBag01Icon}
                            size={28}
                            strokeWidth={1.5}
                            className="mb-3 text-zinc-300"
                        />

                        <h2 className="text-base font-medium text-zinc-950">
                            {search
                                ? "Nenhuma venda encontrada"
                                : "Nenhuma venda registrada"}
                        </h2>

                        <p className="mt-1 max-w-sm text-sm text-zinc-500">
                            {search
                                ? "Tente buscar por outro cliente ou camisa."
                                : "Quando você finalizar uma venda no PDV, ela aparecerá aqui."}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
