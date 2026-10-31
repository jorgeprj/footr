
import { Suspense } from "react";
import { connection } from "next/server";
import { FinanceView } from "@/views/finance/finance-view";

function FinanceSkeleton() {
    return (
        <main className="space-y-8">
            <header className="space-y-2">
                <div className="h-7 w-36 animate-pulse rounded bg-zinc-100" />
                <div className="h-4 w-64 animate-pulse rounded bg-zinc-100" />
            </header>

            <section className="space-y-4">
                <div className="h-5 w-40 animate-pulse rounded bg-zinc-100" />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <div
                            key={index}
                            className="h-20 animate-pulse rounded-lg bg-zinc-100"
                        />
                    ))}
                </div>
            </section>

            <section className="space-y-4">
                <div className="h-5 w-48 animate-pulse rounded bg-zinc-100" />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="h-12 animate-pulse rounded-lg bg-zinc-100" />
                    <div className="h-12 animate-pulse rounded-lg bg-zinc-100" />
                </div>

                <div className="h-10 w-40 animate-pulse rounded-lg bg-zinc-100" />
            </section>

            <section className="space-y-4">
                <div className="h-5 w-48 animate-pulse rounded bg-zinc-100" />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div
                            key={index}
                            className="h-28 animate-pulse rounded-lg bg-zinc-100"
                        />
                    ))}
                </div>
            </section>
        </main>
    );
}

async function FinanceContent() {
    await connection();

    return <FinanceView />;
}

export default function FinancePage() {
    return (
        <Suspense fallback={<FinanceSkeleton />}>
            <FinanceContent />
        </Suspense>
    );
}
