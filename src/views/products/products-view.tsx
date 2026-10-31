"use client";

import { useState } from "react";

import type { Product } from "@/modules/products/domain/product";
import type { ProductImportPreview } from "@/modules/products/domain/product-import";

import { ProductTable } from "@/views/products/product-table";

import { CreateProductDialog } from "@/features/products/ui/create-product-dialog";
import { ProductImportForm } from "@/features/products/ui/product-import-form";
import { ProductImportDialog } from "@/features/products/ui/product-import-dialog";

interface ProductsViewProps {
    products: Product[];
}

export function ProductsView({ products }: ProductsViewProps) {
    const [importPreview, setImportPreview] =
        useState<ProductImportPreview | null>(null);

    return (
        <main className="space-y-10">
            <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
                        Produtos
                    </h1>

                    <p className="mt-1 text-sm text-zinc-500">
                        Gerencie os produtos e o estoque da sua loja.
                    </p>
                </div>

                <CreateProductDialog />
            </header>

            <section className="space-y-4">
                <div>
                    <h2 className="text-sm font-semibold text-zinc-950">
                        Importar produtos
                    </h2>

                    <p className="mt-1 text-sm text-zinc-500">
                        Adicione vários produtos de uma só vez.
                    </p>
                </div>

                <ProductImportForm onPreview={setImportPreview} />
            </section>

            <section>
                <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <h2 className="text-sm font-semibold text-zinc-950">
                        Todos os produtos
                    </h2>
                </div>

                <ProductTable products={products} />
            </section>

            {importPreview && (
                <ProductImportDialog
                    preview={importPreview}
                    onClose={() => setImportPreview(null)}
                />
            )}
        </main>
    );
}