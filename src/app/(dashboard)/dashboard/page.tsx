import { Suspense } from "react";
import { connection } from "next/server";

import { DashboardView } from "@/views/dashboard/dashboard-view";

function DashboardPageSkeleton() {
    return (
        <main className="animate-pulse space-y-10">
            <div className="space-y-2">
                <div className="h-7 w-40 rounded bg-zinc-100" />
                <div className="h-4 w-64 rounded bg-zinc-100" />
            </div>

            <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="space-y-3">
                        <div className="h-4 w-28 rounded bg-zinc-100" />
                        <div className="h-8 w-36 rounded bg-zinc-100" />
                    </div>
                ))}
            </div>

            <div className="h-64 rounded-lg bg-zinc-100" />
        </main>
    );
}

async function DashboardContent() {
    await connection();

    return <DashboardView />;
}

export default function DashboardPage() {
    return (
        <Suspense fallback={<DashboardPageSkeleton />}>
            <DashboardContent />
        </Suspense>
    );
}
