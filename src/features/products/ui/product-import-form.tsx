"use client";

import { useRef, useState, useTransition } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    CloudUploadIcon,
    FileCheckIcon,
} from "@hugeicons/core-free-icons";

import { previewProductImport } from "@/features/products/preview-product-import";

import type { ProductImportPreview } from "@/modules/products/domain/product-import";

interface ProductImportFormProps {
    onPreview: (preview: ProductImportPreview) => void;
}

export function ProductImportForm({
    onPreview,
}: ProductImportFormProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isPending, startTransition] = useTransition();

    function processFile(selectedFile?: File) {
        if (!selectedFile) return;

        const extension = selectedFile.name.split(".").pop()?.toLowerCase();

        if (!["csv", "xlsx", "json"].includes(extension ?? "")) {
            setFile(null);
            setError("Formato não suportado. Utilize CSV, XLSX ou JSON.");
            return;
        }

        if (selectedFile.size > 10 * 1024 * 1024) {
            setFile(null);
            setError("O arquivo deve ter no máximo 10 MB.");
            return;
        }

        if (selectedFile.size === 0) {
            setFile(null);
            setError("O arquivo selecionado está vazio.");
            return;
        }

        setFile(selectedFile);
        setError(null);

        const formData = new FormData();
        formData.append("file", selectedFile);

        startTransition(async () => {
            try {
                const result = await previewProductImport(formData);
                onPreview(result);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Não foi possível carregar o arquivo.",
                );
            }
        });
    }

    return (
        <section className="space-y-3">
            <input
                ref={inputRef}
                type="file"
                accept=".csv,.xlsx,.json"
                className="hidden"
                disabled={isPending}
                onChange={(event) => {
                    processFile(event.target.files?.[0]);
                    event.target.value = "";
                }}
            />

            <button
                type="button"
                disabled={isPending}
                onClick={() => inputRef.current?.click()}
                onDragOver={(event) => {
                    event.preventDefault();
                    setIsDragging(true);
                }}
                onDragLeave={(event) => {
                    event.preventDefault();
                    setIsDragging(false);
                }}
                onDrop={(event) => {
                    event.preventDefault();
                    setIsDragging(false);
                    processFile(event.dataTransfer.files?.[0]);
                }}
                className={`flex min-h-44 w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 py-8 text-center transition-colors disabled:cursor-wait ${
                    isDragging
                        ? "border-zinc-950 bg-zinc-100"
                        : "border-zinc-300 hover:border-zinc-500 hover:bg-zinc-50"
                }`}
            >
                {isPending ? (
                    <>
                        <span className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-950" />

                        <span className="text-sm font-medium text-zinc-950">
                            Processando arquivo...
                        </span>

                        <span className="text-xs text-zinc-500">
                            Validando os produtos. Isso pode levar alguns
                            segundos.
                        </span>
                    </>
                ) : file && !error ? (
                    <>
                        <HugeiconsIcon
                            icon={FileCheckIcon}
                            size={28}
                            className="text-zinc-950"
                        />

                        <span className="text-sm font-medium text-zinc-950">
                            {file.name}
                        </span>

                        <span className="text-xs text-zinc-500">
                            Arquivo carregado. Clique ou arraste outro para
                            substituir.
                        </span>
                    </>
                ) : (
                    <>
                        <HugeiconsIcon
                            icon={CloudUploadIcon}
                            size={28}
                            className="text-zinc-500"
                        />

                        <span className="text-sm font-medium text-zinc-950">
                            Arraste seu arquivo até aqui
                        </span>

                        <span className="text-sm text-zinc-500">
                            ou clique para selecionar no computador
                        </span>

                        <span className="text-xs text-zinc-400">
                            CSV, XLSX ou JSON · Máximo de 10 MB
                        </span>
                    </>
                )}
            </button>

            {error && (
                <p role="alert" className="text-sm text-red-600">
                    {error}
                </p>
            )}
        </section>
    );
}