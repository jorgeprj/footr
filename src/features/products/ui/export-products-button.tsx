"use client";

import { useState } from "react";

import { HugeiconsIcon } from "@hugeicons/react";
import {
    Download01Icon,
    ArrowDown01Icon,
    File02Icon,
    FileBracesIcon,
} from "@hugeicons/core-free-icons";

type ExportFormat = "json" | "csv" | "xlsx";

const EXPORT_OPTIONS: {
    format: ExportFormat;
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

export function ExportProductsButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleExport(format: ExportFormat) {
        try {
            setIsExporting(true);
            setError(null);
            setIsOpen(false);

            const response = await fetch(
                `/api/products/export?format=${format}`,
            );

            if (!response.ok) {
                throw new Error("Não foi possível exportar os produtos.");
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);

            const link = document.createElement("a");

            link.href = url;
            link.download = `footr-produtos.${format}`;
            document.body.appendChild(link);
            link.click();
            link.remove();

            URL.revokeObjectURL(url);
        } catch {
            setError("Erro ao exportar os produtos. Tente novamente.");
        } finally {
            setIsExporting(false);
        }
    }

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setIsOpen((current) => !current)}
                disabled={isExporting}
                aria-expanded={isOpen}
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

            {isOpen && (
                <div
                    role="menu"
                    className="absolute right-0 z-20 mt-2 w-48 bg-white py-1 shadow-lg ring-1 ring-zinc-200"
                >
                    {EXPORT_OPTIONS.map((option) => (
                        <button
                            key={option.format}
                            type="button"
                            role="menuitem"
                            onClick={() => handleExport(option.format)}
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

            {error && (
                <p className="absolute right-0 mt-2 w-64 text-right text-xs text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
}