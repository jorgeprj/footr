import { Suspense } from "react";
import { connection } from "next/server";

import { ProductsView } from "@/views/products/products-view";
import { listProducts } from "@/features/products/list-products";
import { Product } from "@/modules/products";

function ProductsSkeleton() {
    return (
        <main className="animate-pulse space-y-10">
            <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                <div>
                    <div className="h-7 w-32 rounded bg-zinc-100" />
                    <div className="mt-2 h-4 w-64 rounded bg-zinc-100" />
                </div>

                <div className="h-10 w-36 rounded bg-zinc-100" />
            </header>

            <section className="space-y-4">
                <div>
                    <div className="h-4 w-36 rounded bg-zinc-100" />
                    <div className="mt-2 h-4 w-64 rounded bg-zinc-100" />
                </div>

                <div className="h-32 w-full rounded bg-zinc-100" />
            </section>

            <section>
                <div className="mb-4 flex justify-between">
                    <div className="h-4 w-32 rounded bg-zinc-100" />
                    <div className="h-4 w-20 rounded bg-zinc-100" />
                </div>

                <div className="border-y border-zinc-100">
                    <div className="flex gap-8 border-b border-zinc-100 px-4 py-4">
                        {Array.from({ length: 8 }).map((_, index) => (
                            <div
                                key={index}
                                className="h-3 flex-1 rounded bg-zinc-100"
                            />
                        ))}
                    </div>

                    {Array.from({ length: 5 }).map((_, index) => (
                        <div
                            key={index}
                            className="flex gap-8 border-b border-zinc-100 px-4 py-6"
                        >
                            {Array.from({ length: 8 }).map((_, cellIndex) => (
                                <div
                                    key={cellIndex}
                                    className="h-3 flex-1 rounded bg-zinc-100"
                                />
                            ))}
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
}

async function ProductsContent() {
    await connection();

    let products: Product[] = [];
    let hasError = false;

    try {
        products = await listProducts();
    } catch {
        hasError = true;
    }

    if (hasError) {
        return (
            <main className="py-12">
                <p className="text-sm text-zinc-500">
                    Não foi possível carregar os produtos.
                </p>
            </main>
        );
    }

    return <ProductsView products={products} />;
}

export default function ProductsPage() {
    return (
        <Suspense fallback={<ProductsSkeleton />}>
            <ProductsContent />
        </Suspense>
    );
}