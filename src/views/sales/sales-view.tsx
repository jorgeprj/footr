
"use client";

import { useState } from "react";

import { HugeiconsIcon } from "@hugeicons/react";
import {
    Download01Icon,
    ArrowDown01Icon,
    File02Icon,
    FileBracesIcon,
} from "@hugeicons/core-free-icons";

import { getSaleDetails } from "@/features/sales/get-sale-details";
import { handleSalesExport } from "@/features/sales/handle-sales-export";
import type { SalesExportFormat } from "@/features/sales/export-sales-file";

import type {
    Sale,
    SaleDetails as SaleDetailsType,
} from "@/modules/sales/domain/sale";

import { SalesTable } from "./sales-table";
import { SalesDetails } from "./sales-details";

interface SalesViewProps {
    initialSales: Sale[];
}

const EXPORT_OPTIONS: {
    format: SalesExportFormat;
    label: string;
}[] = [
        {
            format: "json",
            label: "Exportar JSON",
        },
        {
            format: "csv",
            label: "Exportar CSV",
        },
        {
            format: "xlsx",
            label: "Exportar Excel",
        },
    ];

export function SalesView({ initialSales }: SalesViewProps) {
    const [selectedSale, setSelectedSale] = useState<SaleDetailsType | null>(
        null,
    );
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [detailsError, setDetailsError] = useState<string | null>(null);

    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [exportError, setExportError] = useState<string | null>(null);

    async function handleSelectSale(saleId: string) {
        setIsLoadingDetails(true);
        setDetailsError(null);

        try {
            const result = await getSaleDetails(saleId);

            if (!result.success) {
                setDetailsError(result.error);
                return;
            }

            setSelectedSale(result.data);
        } catch {
            setDetailsError(
                "Não foi possível carregar os detalhes da venda.",
            );
        } finally {
            setIsLoadingDetails(false);
        }
    }

    async function handleExport(format: SalesExportFormat) {
        try {
            setIsExporting(true);
            setExportError(null);
            setIsExportMenuOpen(false);

            const result = await handleSalesExport(format);

            if (!result.success) {
                setExportError(
                    result.error ?? "Não foi possível exportar as vendas.",
                );
            }
        } catch {
            setExportError(
                "Erro ao exportar as vendas. Tente novamente.",
            );
        } finally {
            setIsExporting(false);
        }
    }

    function handleBack() {
        setSelectedSale(null);
        setDetailsError(null);
    }

    if (selectedSale) {
        return (
            <SalesDetails
                sale={selectedSale}
                onBack={handleBack}
            />
        );
    }

    return (
        <main className="space-y-8">
            <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
                        Vendas
                    </h1>

                    <p className="text-sm text-zinc-500">
                        Acompanhe e consulte as vendas da sua loja.
                    </p>
                </div>

                <div className="flex flex-col gap-3 sm:items-end">
                    <div className="flex items-center gap-4">
                        <p className="text-sm text-zinc-500">
                            <span className="font-medium text-zinc-950">
                                {initialSales.length}
                            </span>{" "}
                            {initialSales.length === 1
                                ? "venda registrada"
                                : "vendas registradas"}
                        </p>

                        <div className="relative">
                            <button
                                type="button"
                                onClick={() =>
                                    setIsExportMenuOpen((current) => !current)
                                }
                                disabled={
                                    isExporting || initialSales.length === 0
                                }
                                aria-expanded={isExportMenuOpen}
                                aria-haspopup="menu"
                                className="inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <HugeiconsIcon
                                    icon={Download01Icon}
                                    size={18}
                                    strokeWidth={1.8}
                                />

                                {isExporting ? "Exportando..." : "Exportar"}

                                <HugeiconsIcon
                                    icon={ArrowDown01Icon}
                                    size={16}
                                    strokeWidth={1.8}
                                />
                            </button>

                            {isExportMenuOpen && (
                                <div
                                    role="menu"
                                    className="absolute right-0 z-20 mt-2 w-48 bg-white py-1 shadow-lg ring-1 ring-zinc-200 rounded-xl"
                                >
                                    {EXPORT_OPTIONS.map((option) => (
                                        <button
                                            key={option.format}
                                            type="button"
                                            role="menuitem"
                                            onClick={() =>
                                                handleExport(option.format)
                                            }
                                            className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm text-zinc-700 transition-colors hover:bg-zinc-50 hover:text-zinc-950"
                                        >
                                            <HugeiconsIcon
                                                icon={
                                                    option.format === "json"
                                                        ? FileBracesIcon
                                                        : File02Icon
                                                }
                                                size={18}
                                                strokeWidth={1.8}
                                            />

                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {exportError && (
                        <p
                            role="alert"
                            className="text-right text-xs text-red-600"
                        >
                            {exportError}
                        </p>
                    )}
                </div>
            </header>

            <SalesTable
                sales={initialSales}
                onSelectSale={handleSelectSale}
            />

            {isLoadingDetails && (
                <div
                    className="space-y-4 py-6"
                    aria-live="polite"
                    aria-label="Carregando detalhes da venda"
                >
                    <div className="h-5 w-40 animate-pulse rounded bg-zinc-100" />
                    <div className="h-16 w-full animate-pulse rounded bg-zinc-100" />
                    <div className="h-16 w-full animate-pulse rounded bg-zinc-100" />
                </div>
            )}

            {detailsError && (
                <p role="alert" className="text-sm text-red-600">
                    {detailsError}
                </p>
            )}
        </main>
    );
}
