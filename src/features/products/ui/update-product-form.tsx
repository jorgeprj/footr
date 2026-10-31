"use client";

import { useState, useTransition } from "react";

import { updateProduct } from "@/features/products/update-product";

import type { Product, ProductInput } from "@/modules/products/domain/product";

interface UpdateProductFormProps {
    product: Product;
    onSuccess: () => void;
}

type FormValues = {
    teamName: string;
    season: string;
    type: string;
    version: string;
    size: string;
    costPrice: string;
    salePrice: string;
};

function parsePrice(value: string): number {
    return Number(value.trim().replace(",", "."));
}

export function UpdateProductForm({
    product,
    onSuccess,
}: UpdateProductFormProps) {
    const [form, setForm] = useState<FormValues>({
        teamName: product.teamName,
        season: product.season,
        type: product.type,
        version: product.version,
        size: product.size,
        costPrice: String(product.costPrice),
        salePrice: String(product.salePrice),
    });

    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    function updateField(field: keyof FormValues, value: string) {
        setForm((current) => ({ ...current, [field]: value }));
    }

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);

        const input: ProductInput = {
            teamName: form.teamName,
            season: form.season,
            type: form.type,
            version: form.version,
            size: form.size,
            costPrice: parsePrice(form.costPrice),
            salePrice: parsePrice(form.salePrice),
        };

        startTransition(async () => {
            try {
                await updateProduct(product.id, input);
                onSuccess();
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Não foi possível atualizar o produto.",
                );
            }
        });
    }

    const inputClass =
        "w-full border-b border-zinc-200 bg-transparent px-0 py-3 text-sm text-zinc-950 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-950 disabled:opacity-50";

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div>
                <label className="text-xs font-medium text-zinc-600">
                    Time
                </label>
                <input
                    required
                    value={form.teamName}
                    onChange={(event) =>
                        updateField("teamName", event.target.value)
                    }
                    className={inputClass}
                    disabled={isPending}
                />
            </div>

            <div className="grid grid-cols-2 gap-5">
                <div>
                    <label className="text-xs font-medium text-zinc-600">
                        Temporada
                    </label>
                    <input
                        required
                        value={form.season}
                        onChange={(event) =>
                            updateField("season", event.target.value)
                        }
                        className={inputClass}
                        disabled={isPending}
                    />
                </div>

                <div>
                    <label className="text-xs font-medium text-zinc-600">
                        Tipo
                    </label>
                    <input
                        required
                        value={form.type}
                        onChange={(event) =>
                            updateField("type", event.target.value)
                        }
                        className={inputClass}
                        disabled={isPending}
                    />
                </div>

                <div>
                    <label className="text-xs font-medium text-zinc-600">
                        Versão
                    </label>
                    <input
                        required
                        value={form.version}
                        onChange={(event) =>
                            updateField("version", event.target.value)
                        }
                        className={inputClass}
                        disabled={isPending}
                    />
                </div>

                <div>
                    <label className="text-xs font-medium text-zinc-600">
                        Tamanho
                    </label>
                    <input
                        required
                        value={form.size}
                        onChange={(event) =>
                            updateField("size", event.target.value)
                        }
                        className={inputClass}
                        disabled={isPending}
                    />
                </div>

                <div>
                    <label className="text-xs font-medium text-zinc-600">
                        Preço de custo
                    </label>
                    <input
                        required
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.costPrice}
                        onChange={(event) =>
                            updateField("costPrice", event.target.value)
                        }
                        className={inputClass}
                        disabled={isPending}
                    />
                </div>

                <div>
                    <label className="text-xs font-medium text-zinc-600">
                        Preço de venda
                    </label>
                    <input
                        required
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.salePrice}
                        onChange={(event) =>
                            updateField("salePrice", event.target.value)
                        }
                        className={inputClass}
                        disabled={isPending}
                    />
                </div>
            </div>

            {error && (
                <p role="alert" className="text-sm text-red-600">
                    {error}
                </p>
            )}

            <div className="flex justify-end pt-3">
                <button
                    type="submit"
                    disabled={isPending}
                    className="rounded-full bg-zinc-950 px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    {isPending ? "Salvando..." : "Salvar alterações"}
                </button>
            </div>
        </form>
    );
}