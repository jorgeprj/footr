"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { CreateProductForm } from "./create-product-form";

export function CreateProductDialog() {
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
                className="rounded-full bg-zinc-950 px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-80"
            >
                Novo produto
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <section
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="create-product-title"
                        className="w-full max-w-xl bg-white rounded-2xl"
                    >
                        <header className="flex items-start justify-between border-b border-zinc-100 p-6">
                            <div>
                                <h2
                                    id="create-product-title"
                                    className="text-xl font-semibold tracking-tight text-zinc-950"
                                >
                                    Cadastrar produto
                                </h2>

                                <p className="mt-1 text-sm text-zinc-500">
                                    Adicione uma camisa ao estoque.
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
                            <CreateProductForm onSuccess={handleSuccess} />
                        </div>
                    </section>
                </div>
            )}
        </>
    );
}