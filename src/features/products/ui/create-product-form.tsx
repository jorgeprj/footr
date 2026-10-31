"use client";

import { useState, useTransition } from "react";

import { createProduct } from "@/features/products/create-product";

import type { ProductInput } from "@/modules/products/domain/product";

interface CreateProductFormProps {
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

const INITIAL_VALUES: FormValues = {
    teamName: "",
    season: "",
    type: "Home",
    version: "Torcedor",
    size: "",
    costPrice: "",
    salePrice: "",
};

function parsePrice(value: string): number {
    const normalized = value.trim().replace(",", ".");
    return Number(normalized);
}

export function CreateProductForm({ onSuccess }: CreateProductFormProps) {
    const [form, setForm] = useState(INITIAL_VALUES);
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
                await createProduct(input);
                onSuccess();
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Não foi possível cadastrar o produto.",
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
                    placeholder="Ex.: Manchester United"
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
                        placeholder="Ex.: 2007/08"
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
                        placeholder="Ex.: Home"
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
                        placeholder="Ex.: Torcedor"
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
                        placeholder="Ex.: M"
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
                        placeholder="0,00"
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
                        placeholder="0,00"
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
                    {isPending ? "Cadastrando..." : "Cadastrar produto"}
                </button>
            </div>
        </form>
    );
}