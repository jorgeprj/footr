"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
    validateProduct,
    type ProductInput,
} from "@/modules/products/domain/product";

import type {
    ProductImportPreview,
    ProductImportResult,
} from "@/modules/products/domain/product-import";
import { importProducts } from "../import-products";

interface ProductImportDialogProps {
    preview: ProductImportPreview;
    onClose: () => void;
}

type ProductField = keyof ProductInput;

const FIELDS: {
    key: ProductField;
    label: string;
    type: "text" | "number";
}[] = [
    { key: "teamName", label: "Time", type: "text" },
    { key: "season", label: "Temporada", type: "text" },
    { key: "type", label: "Tipo", type: "text" },
    { key: "version", label: "Versão", type: "text" },
    { key: "size", label: "Tamanho", type: "text" },
    { key: "costPrice", label: "Preço de custo", type: "number" },
    { key: "salePrice", label: "Preço de venda", type: "number" },
];

function revalidateRow(
    row: ProductImportResult,
    field: ProductField,
    value: string,
): ProductImportResult {
    const data: ProductInput = {
        ...row.data,
        [field]:
            field === "costPrice" || field === "salePrice"
                ? value === ""
                    ? Number.NaN
                    : Number(value)
                : value,
    };

    const errors = Object.values(validateProduct(data));

    return {
        ...row,
        data,
        errors,
        valid: errors.length === 0,
    };
}

export function ProductImportDialog({
    preview,
    onClose,
}: ProductImportDialogProps) {
    const router = useRouter();

    const [rows, setRows] = useState(preview.rows);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const validCount = rows.filter((row) => row.valid).length;
    const invalidCount = rows.length - validCount;
    const canImport = rows.length > 0 && invalidCount === 0;

    function updateRow(
        rowNumber: number,
        field: ProductField,
        value: string,
    ) {
        setRows((currentRows) =>
            currentRows.map((row) =>
                row.rowNumber === rowNumber
                    ? revalidateRow(row, field, value)
                    : row,
            ),
        );

        setError(null);
    }

    function handleImport() {
        if (!canImport || isPending) return;

        const products = rows.map((row) => row.data);

        startTransition(async () => {
            try {
                await importProducts(products);
                router.refresh();
                onClose();
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Não foi possível cadastrar os produtos.",
                );
            }
        });
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="import-preview-title"
                className="flex max-h-[90vh] w-full max-w-7xl flex-col bg-white rounded-2xl"
            >
                <header className="flex items-start justify-between gap-4 border-b border-zinc-100 p-6">
                    <div>
                        <h2
                            id="import-preview-title"
                            className="text-xl font-semibold tracking-tight text-zinc-950"
                        >
                            Revisar importação
                        </h2>

                        <p className="mt-1 text-sm text-zinc-500">
                            Confira e edite os dados antes de cadastrar.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isPending}
                        className="text-sm text-zinc-500 hover:text-zinc-950 disabled:opacity-50"
                    >
                        Fechar
                    </button>
                </header>

                <div className="flex flex-wrap gap-6 px-6 py-4 text-sm">
                    <p>
                        Total:{" "}
                        <strong className="text-zinc-950">
                            {rows.length}
                        </strong>
                    </p>

                    <p className="text-green-700">
                        Válidos: <strong>{validCount}</strong>
                    </p>

                    <p className="text-red-600">
                        Inválidos: <strong>{invalidCount}</strong>
                    </p>
                </div>

                <div className="min-h-0 flex-1 overflow-auto px-6">
                    <table className="w-full min-w-275 text-left text-sm">
                        <thead className="sticky top-0 bg-white text-xs text-zinc-500">
                            <tr>
                                <th className="py-3 pr-3 font-medium">
                                    Linha
                                </th>

                                {FIELDS.map((field) => (
                                    <th
                                        key={field.key}
                                        className="px-2 py-3 font-medium"
                                    >
                                        {field.label}
                                    </th>
                                ))}

                                <th className="px-2 py-3 font-medium">
                                    Status
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {rows.map((row) => (
                                <tr
                                    key={row.rowNumber}
                                    className="border-t border-zinc-100 align-top"
                                >
                                    <td className="py-3 pr-3 text-zinc-500">
                                        {row.rowNumber}
                                    </td>

                                    {FIELDS.map((field) => {
                                        const value = row.data[field.key];

                                        return (
                                            <td
                                                key={field.key}
                                                className="px-2 py-2"
                                            >
                                                <input
                                                    type={field.type}
                                                    min={
                                                        field.type === "number"
                                                            ? 0
                                                            : undefined
                                                    }
                                                    step={
                                                        field.type === "number"
                                                            ? "0.01"
                                                            : undefined
                                                    }
                                                    value={
                                                        field.type === "number"
                                                            ? typeof value === "number" &&
                                                              Number.isFinite(value)
                                                                ? value
                                                                : ""
                                                            : String(value)
                                                    }
                                                    onChange={(event) =>
                                                        updateRow(
                                                            row.rowNumber,
                                                            field.key,
                                                            event.target.value,
                                                        )
                                                    }
                                                    disabled={isPending}
                                                    className="w-full min-w-24 border-b border-transparent bg-transparent px-1 py-2 text-zinc-950 outline-none transition-colors focus:border-zinc-950 disabled:opacity-50"
                                                />
                                            </td>
                                        );
                                    })}

                                    <td className="px-2 py-3">
                                        <span
                                            className={
                                                row.valid
                                                    ? "text-green-700"
                                                    : "text-red-600"
                                            }
                                        >
                                            {row.valid
                                                ? "Válido"
                                                : "Inválido"}
                                        </span>

                                        {!row.valid && (
                                            <p className="mt-1 max-w-48 text-xs text-red-600">
                                                {row.errors.join(" ")}
                                            </p>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <footer className="border-t border-zinc-100 p-6">
                    {error && (
                        <p
                            role="alert"
                            className="mb-4 text-sm text-red-600"
                        >
                            {error}
                        </p>
                    )}

                    {invalidCount > 0 && (
                        <p className="mb-4 text-sm text-zinc-500">
                            Corrija os {invalidCount} produtos inválidos para
                            continuar.
                        </p>
                    )}

                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={handleImport}
                            disabled={!canImport || isPending}
                            className="rounded-full bg-zinc-950 px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            {isPending
                                ? "Cadastrando produtos..."
                                : "Cadastrar produtos"}
                        </button>
                    </div>
                </footer>
            </section>
        </div>
    );
}