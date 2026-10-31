
"use client";

import { useRef, useState, useTransition } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import ExcelJS from "exceljs-community";
import {
    CloudUploadIcon,
    FileCheckIcon,
    Download01Icon,
    ArrowUpRight01Icon,
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
    const [isDownloading, setIsDownloading] = useState(false);
    const [isPending, startTransition] = useTransition();

    async function downloadTemplate() {
        setIsDownloading(true);
        setError(null);

        try {
            const workbook = new ExcelJS.Workbook();

            workbook.creator = "Footr";
            workbook.subject = "Modelo de importação de produtos";
            workbook.title = "Modelo de produtos Footr";

            const worksheet = workbook.addWorksheet("Produtos");

            worksheet.columns = [
                { header: "team_name", key: "team_name", width: 28 },
                { header: "season", key: "season", width: 16 },
                { header: "type", key: "type", width: 18 },
                { header: "version", key: "version", width: 18 },
                { header: "size", key: "size", width: 12 },
                { header: "cost_price", key: "cost_price", width: 18 },
                { header: "sale_price", key: "sale_price", width: 18 },
            ];

            worksheet.getRow(1).font = {
                bold: true,
            };

            worksheet.getRow(1).fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFE4E4E7" },
            };

            worksheet.getColumn("cost_price").numFmt = '#,##0.00';
            worksheet.getColumn("sale_price").numFmt = '#,##0.00';

            worksheet.views = [
                {
                    state: "frozen",
                    ySplit: 1,
                },
            ];

            worksheet.autoFilter = {
                from: "A1",
                to: "G1",
            };

            const buffer = await workbook.xlsx.writeBuffer();

            const blob = new Blob([buffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = url;
            link.download = "footr-modelo-importacao.xlsx";

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            window.setTimeout(() => {
                window.URL.revokeObjectURL(url);
            }, 1000);
        } catch {
            setError("Não foi possível gerar o modelo de planilha.");
        } finally {
            setIsDownloading(false);
        }
    }

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
        <section className="space-y-4">
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
                className={`flex min-h-44 w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 py-8 text-center transition-colors disabled:cursor-wait ${isDragging
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


            <div className="flex flex-col gap-3 rounded-xl bg-zinc-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-zinc-700">
                        <HugeiconsIcon
                            icon={FileCheckIcon}
                            size={19}
                        />
                    </div>

                    <div>
                        <p className="text-sm font-medium text-zinc-950">
                            Precisa de ajuda para importar?
                        </p>

                        <p className="mt-1 text-xs text-zinc-500">
                            Baixe nosso modelo ou consulte o guia de preenchimento.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                    <button
                        type="button"
                        onClick={downloadTemplate}
                        disabled={isDownloading}
                        className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-zinc-950 px-3 text-xs font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-wait disabled:opacity-50"
                    >
                        <HugeiconsIcon
                            icon={Download01Icon}
                            size={16}
                        />

                        {isDownloading ? "Gerando..." : "Baixar modelo"}
                    </button>

                    <a
                        href="/blog/como-importar-produtos-automaticamente"
                        className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100"
                    >
                        Ver guia
                        <HugeiconsIcon
                            icon={ArrowUpRight01Icon}
                            size={15}
                        />
                    </a>
                </div>
            </div>


            {error && (
                <p role="alert" className="text-sm text-red-600">
                    {error}
                </p>
            )}
        </section>
    );
}
