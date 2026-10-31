"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { Product } from "@/modules/products";
import { UpdateProductForm } from "./update-product-form";
import { HugeiconsIcon } from "@hugeicons/react";
import Edit02Icon from "@hugeicons/core-free-icons/Edit02Icon";

interface UpdateProductDialogProps {
    product: Product;
}

export function UpdateProductDialog({
    product,
}: UpdateProductDialogProps) {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);

    function handleSuccess() {
        setIsOpen(false);
        router.refresh();
    }

    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                title="Editar produto"
                aria-label="Editar produto"
                className="flex size-9 items-center justify-center text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-950 rounded-full"
            >
                <HugeiconsIcon
                    icon={Edit02Icon}
                    size={18}
                    strokeWidth={1.8}
                />
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <section
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="update-product-title"
                        className="w-full max-w-xl bg-white rounded-2xl"
                    >
                        <header className="flex items-start justify-between border-b border-zinc-100 p-6">
                            <div>
                                <h2
                                    id="update-product-title"
                                    className="text-xl font-semibold tracking-tight text-zinc-950"
                                >
                                    Editar produto
                                </h2>

                                <p className="mt-1 text-sm text-zinc-500">
                                    Atualize as informações da camisa.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="text-sm text-zinc-500 hover:text-zinc-950"
                            >
                                Fechar
                            </button>
                        </header>

                        <div className="p-6">
                            <UpdateProductForm
                                product={product}
                                onSuccess={handleSuccess}
                            />
                        </div>
                    </section>
                </div>
            )}
        </>
    );
}