
import { Suspense } from "react";
import { connection } from "next/server";

import { createProductUseCases } from "@/modules/products/server";
import { PosView } from "@/views/pos/pos-view";

function PosSkeleton() {
    return (
        <main className="animate-pulse space-y-8">
            <header>
                <div className="h-7 w-24 rounded bg-zinc-100" />
                <div className="mt-2 h-4 w-64 rounded bg-zinc-100" />
            </header>

            <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
                <section className="space-y-6">
                    <div className="h-12 w-full rounded-full bg-zinc-100" />

                    <div className="h-11 w-40 rounded-full bg-zinc-100" />

                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <div className="h-4 w-36 rounded bg-zinc-100" />
                            <div className="h-4 w-20 rounded bg-zinc-100" />
                        </div>

                        {Array.from({ length: 5 }).map((_, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-3 border-b border-zinc-100 py-4"
                            >
                                <div className="size-14 shrink-0 rounded-xl bg-zinc-100" />

                                <div className="flex-1 space-y-2">
                                    <div className="h-4 w-40 rounded bg-zinc-100" />
                                    <div className="h-3 w-28 rounded bg-zinc-100" />
                                    <div className="h-3 w-20 rounded bg-zinc-100" />
                                </div>

                                <div className="space-y-2">
                                    <div className="h-4 w-20 rounded bg-zinc-100" />
                                    <div className="ml-auto size-9 rounded-full bg-zinc-100" />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <aside className="hidden space-y-6 lg:block">
                    <div className="h-5 w-24 rounded bg-zinc-100" />

                    <div className="h-40 rounded bg-zinc-100" />

                    <div className="h-12 rounded-full bg-zinc-100" />
                </aside>
            </div>
        </main>
    );
}

async function PosContent() {
    await connection();

    try {
        const { listProducts, storeId } = await createProductUseCases();

        const products = await listProducts.execute(storeId);

        const availableProducts = products
            .filter((product) => product.status === "available")

        return <PosView products={availableProducts} />;
    } catch {
        return (
            <main className="py-12">
                <p className="text-sm text-zinc-500">
                    Não foi possível carregar os produtos para o PDV.
                </p>
            </main>
        );
    }
}

export default function PosPage() {
    return (
        <Suspense fallback={<PosSkeleton />}>
            <PosContent />
        </Suspense>
    );
}
