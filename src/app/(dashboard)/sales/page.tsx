
import { Suspense } from "react";
import { connection } from "next/server";

import { createSaleUseCases } from "@/modules/sales/server";
import { SalesView } from "@/views/sales/sales-view";
import type { Sale } from "@/modules/sales/domain/sale";

function SalesSkeleton() {
    return (
        <main className="animate-pulse space-y-10">
            <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                <div>
                    <div className="h-7 w-32 rounded bg-zinc-100" />
                    <div className="mt-2 h-4 w-64 rounded bg-zinc-100" />
                </div>

                <div className="h-4 w-28 rounded bg-zinc-100" />
            </header>

            <div className="h-10 w-full max-w-sm rounded bg-zinc-100" />

            <section className="border-y border-zinc-100">
                <div className="flex gap-8 border-b border-zinc-100 px-4 py-4">
                    {Array.from({ length: 6 }).map((_, index) => (
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
                        {Array.from({ length: 6 }).map((_, cellIndex) => (
                            <div
                                key={cellIndex}
                                className="h-4 flex-1 rounded bg-zinc-100"
                            />
                        ))}
                    </div>
                ))}
            </section>
        </main>
    );
}

async function SalesContent() {
    await connection();

    let sales: Sale[] = [];
    let hasError = false;

    try {
        const { listSales, storeId } = await createSaleUseCases();
        sales = await listSales.execute(storeId);
    } catch {
        hasError = true;
    }

    if (hasError) {
        return (
            <main className="py-12">
                <p className="text-sm text-zinc-500">
                    Não foi possível carregar o histórico de vendas.
                </p>
            </main>
        );
    }

    return <SalesView initialSales={sales} />;
}

export default function SalesPage() {
    return (
        <Suspense fallback={<SalesSkeleton />}>
            <SalesContent />
        </Suspense>
    );
}
