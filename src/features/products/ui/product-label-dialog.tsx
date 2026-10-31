
"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { HugeiconsIcon } from "@hugeicons/react";
import {
    Cancel01Icon,
    PrinterIcon,
    QrCodeIcon,
    BarcodeIcon,
} from "@hugeicons/core-free-icons";

import bwipjs from "bwip-js";

import type { Product } from "@/modules/products/domain/product";

type LabelFormat = "qrcode" | "code128";

interface ProductLabelDialogProps {
    product: Product;
    onClose: () => void;
}

export function ProductLabelDialog({
    product,
    onClose,
}: ProductLabelDialogProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [format, setFormat] = useState<LabelFormat>("qrcode");
    const [codeImage, setCodeImage] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(true);
    const [generationError, setGenerationError] = useState<string | null>(
        null,
    );
    const [isMounted, setIsMounted] = useState(false);

    const formattedPrice = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(product.salePrice);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isMounted) return;

        const canvas = canvasRef.current;

        if (!canvas) return;

        let isActive = true;

        async function generateCode() {
            setIsGenerating(true);
            setCodeImage(null);
            setGenerationError(null);

            try {
                bwipjs.toCanvas(canvas!, {
                    bcid: format,
                    text: product.footrCode,
                    scale: format === "qrcode" ? 5 : 3,
                    height: 15,
                    includetext: false,
                    backgroundcolor: "FFFFFF",
                    barcolor: "000000",
                });

                const image = canvas!.toDataURL("image/png");

                if (isActive) {
                    setCodeImage(image);
                }
            } catch (error) {
                console.error("[PRODUCT_LABEL_ERROR]", error);

                if (isActive) {
                    setGenerationError(
                        "Não foi possível gerar o código. Tente novamente.",
                    );
                }
            } finally {
                if (isActive) {
                    setIsGenerating(false);
                }
            }
        }

        generateCode();

        return () => {
            isActive = false;
        };
    }, [format, isMounted, product.footrCode]);

    function handlePrint() {
        if (!codeImage) return;

        window.print();
    }

    if (!isMounted) return null;

    return createPortal(
        <>
            <style jsx global>{`
                @media screen {
                    #footr-print-root {
                        display: none;
                    }
                }

                @media print {
                    @page {
                        size: 60mm 80mm;
                        margin: 0;
                    }

                    html,
                    body {
                        width: 60mm !important;
                        height: 80mm !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        background: white !important;
                    }

                    body > *:not(#footr-print-root) {
                        display: none !important;
                    }

                    #footr-print-root {
                        display: flex !important;
                        width: 60mm !important;
                        height: 80mm !important;
                        margin: 0 !important;
                        padding: 6mm !important;
                        background: white !important;
                    }

                    #footr-print-root .footr-label {
                        display: flex !important;
                    }
                }
            `}</style>

            <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
                onMouseDown={(event) => {
                    if (event.target === event.currentTarget) {
                        onClose();
                    }
                }}
            >
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="product-label-title"
                    className="w-full max-w-100 rounded-2xl bg-white p-6"
                >
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h2
                                id="product-label-title"
                                className="text-lg font-semibold text-zinc-950"
                            >
                                Gerar etiqueta
                            </h2>

                            <p className="mt-1 text-sm text-zinc-500">
                                Escolha o formato do código.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Fechar"
                            className="flex size-9 items-center justify-center text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-950"
                        >
                            <HugeiconsIcon
                                icon={Cancel01Icon}
                                size={20}
                                strokeWidth={1.8}
                            />
                        </button>
                    </div>

                    <div className="mb-6 grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={() => setFormat("qrcode")}
                            className={`flex h-11 items-center justify-center gap-2 text-sm font-medium transition-colors rounded-md ${format === "qrcode"
                                ? "bg-zinc-950 text-white"
                                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                                }`}
                        >
                            <HugeiconsIcon
                                icon={QrCodeIcon}
                                size={18}
                                strokeWidth={1.8}
                            />
                            QR Code
                        </button>

                        <button
                            type="button"
                            onClick={() => setFormat("code128")}
                            className={`flex h-11 items-center justify-center gap-2 text-sm font-medium transition-colors rounded-md ${format === "code128"
                                ? "bg-zinc-950 text-white"
                                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                                }`}
                        >
                            <HugeiconsIcon
                                icon={BarcodeIcon}
                                size={18}
                                strokeWidth={1.8}
                            />
                            Código de barras
                        </button>
                    </div>

                    <div className="mb-6 flex justify-center bg-zinc-50 p-5">
                        <div className="flex min-h-40 w-full max-w-64 flex-col items-center justify-center bg-white p-4">
                            {isGenerating && (
                                <p className="text-sm text-zinc-500">
                                    Gerando código...
                                </p>
                            )}

                            {!isGenerating && generationError && (
                                <p className="text-center text-sm text-red-600">
                                    {generationError}
                                </p>
                            )}

                            {!isGenerating && codeImage && (
                                <>
                                    <div className="flex w-full items-center justify-between">
                                        <span className="font-logo text-xl italic tracking-[-0.07em] text-zinc-950">
                                            Footr
                                        </span>

                                        <span className="text-[8px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
                                            Product label
                                        </span>
                                    </div>

                                    <div className="my-4 flex min-h-24 w-full items-center justify-center">
                                        <img
                                            src={codeImage}
                                            alt={`Código ${product.footrCode}`}
                                            className="max-h-24 max-w-full object-contain"
                                        />
                                    </div>

                                    <div className="w-full border-t border-zinc-200 pt-3">
                                        <div className="flex items-end justify-between gap-2">
                                            <div className="min-w-0 text-left">
                                                <p className="truncate text-xs font-bold uppercase text-zinc-950">
                                                    {product.teamName}
                                                </p>

                                                <p className="mt-1 text-[10px] text-zinc-500">
                                                    {product.season} · {product.size} · {product.version}
                                                </p>
                                            </div>

                                            <p className="shrink-0 text-base font-bold tracking-tight text-zinc-950">
                                                {formattedPrice}
                                            </p>
                                        </div>

                                        <p className="mt-3 text-left text-[9px] font-medium tracking-wider text-zinc-400">
                                            {product.footrCode}
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="h-11 flex-1 bg-zinc-100 px-4 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-200 rounded-md"
                        >
                            Cancelar
                        </button>

                        <button
                            type="button"
                            onClick={handlePrint}
                            disabled={!codeImage || isGenerating}
                            className="flex h-11 flex-1 items-center justify-center gap-2 bg-zinc-950 rounded-md px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <HugeiconsIcon
                                icon={PrinterIcon}
                                size={18}
                                strokeWidth={1.8}
                            />
                            Imprimir
                        </button>
                    </div>
                </div>
            </div>

            <canvas
                ref={canvasRef}
                aria-hidden="true"
                className="absolute left-[-9999px] top-[-9999px]"
            />

            <div id="footr-print-root">
                {codeImage && (
                    <div className="footr-label flex h-full w-full flex-col bg-white p-1 text-black">
                        <div className="flex items-center justify-between">
                            <span className="font-logo text-xl italic tracking-[-0.07em]">
                                Footr
                            </span>

                            <span className="text-[6pt] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                                Product label
                            </span>
                        </div>

                        <div className="my-2 flex flex-1 items-center justify-center">
                            <img
                                src={codeImage}
                                alt=""
                                className="max-h-16 max-w-full object-contain"
                            />
                        </div>

                        <div className="border-t border-zinc-200 pt-2">
                            <div className="flex items-end justify-between gap-2">
                                <div className="min-w-0">
                                    <p className="text-[8pt] font-bold uppercase tracking-wide text-nowrap">
                                        {product.teamName}
                                    </p>

                                    <p className="mt-0.5 text-[7pt] text-zinc-500">
                                        {product.season} · {product.size} · {product.version}
                                    </p>
                                </div>

                                <p className="shrink-0 text-[12pt] font-bold tracking-tight">
                                    {formattedPrice}
                                </p>
                            </div>

                            <p className="mt-2 text-[6pt] font-medium tracking-[0.12em] text-zinc-500">
                                {product.footrCode}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </>,
        document.body,
    );
}
