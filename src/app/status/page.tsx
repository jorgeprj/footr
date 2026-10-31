
import { Suspense } from "react";
import { connection } from "next/server";

import { createSupabaseSystemStatusGateway } from "@/modules/system/adapters/supabase/supabase-status-gateway";
import { getSystemStatus } from "@/modules/system/application/get-system-status";
import { StatusView } from "@/views/status/status-view";

function StatusPageSkeleton() {
    return (
        <main className="min-h-screen animate-pulse bg-white px-6 py-12">
            <div className="mx-auto w-full max-w-2xl">
                <div className="flex items-center justify-between">
                    <div className="h-9 w-24 rounded bg-zinc-100" />
                    <div className="h-4 w-24 rounded bg-zinc-100" />
                </div>

                <div className="mt-24 space-y-5">
                    <div className="h-3 w-36 rounded bg-zinc-100" />
                    <div className="h-9 w-3/4 rounded bg-zinc-100" />
                    <div className="h-4 w-52 rounded bg-zinc-100" />
                </div>

                <div className="mt-14 space-y-8">
                    <div className="h-4 w-20 rounded bg-zinc-100" />
                    <div className="h-16 rounded bg-zinc-100" />
                    <div className="h-16 rounded bg-zinc-100" />
                </div>
            </div>
        </main>
    );
}

async function StatusContent() {
    await connection();

    const gateway = createSupabaseSystemStatusGateway();
    const health = await getSystemStatus(gateway);

    return <StatusView health={health} />;
}

export default function SystemStatusRoute() {
    return (
        <Suspense fallback={<StatusPageSkeleton />}>
            <StatusContent />
        </Suspense>
    );
}
