import { Suspense } from "react";

import { createSupabaseSystemStatusGateway } from "@/modules/system/adapters/supabase/supabase-status-gateway";
import { getSystemStatus } from "@/modules/system/application/get-system-status";
import { StatusView } from "@/views/status/status-view";

export const dynamic = "force-dynamic";

function StatusSkeleton() {
    return (
        <main className="min-h-screen bg-white px-6 py-12">
            <div className="mx-auto w-full max-w-2xl animate-pulse">
                <div className="flex items-center justify-between">
                    <div className="h-9 w-24 rounded bg-zinc-100" />
                    <div className="h-4 w-24 rounded bg-zinc-100" />
                </div>

                <div className="mt-24">
                    <div className="h-3 w-36 rounded bg-zinc-100" />
                    <div className="mt-5 h-9 w-3/4 rounded bg-zinc-100" />
                    <div className="mt-8 h-4 w-52 rounded bg-zinc-100" />
                </div>

                <div className="mt-14">
                    <div className="h-4 w-20 rounded bg-zinc-100" />

                    <div className="mt-8 space-y-8">
                        <div className="h-16 rounded bg-zinc-100" />
                        <div className="h-16 rounded bg-zinc-100" />
                    </div>
                </div>
            </div>
        </main>
    );
}

async function StatusContent() {
    const gateway = createSupabaseSystemStatusGateway();
    const health = await getSystemStatus(gateway);

    return <StatusView health={health} />;
}

export default function SystemStatusRoute() {
    return (
        <Suspense fallback={<StatusSkeleton />}>
            <StatusContent />
        </Suspense>
    );
}