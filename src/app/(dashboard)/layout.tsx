
import { Suspense, type ReactNode } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";

import { createSupabaseStoreGateway } from "@/modules/stores/adapters/supabase/supabase-store-gateway";
import { AppShell } from "@/shared/ui/layout/app-shell";
import { StoreIdentity } from "@/shared/ui/layout/store-identity";

function DashboardSkeleton() {
    return (
        <div className="flex h-full animate-pulse flex-col">
            <div className="h-16 shrink-0 bg-white" />

            <div className="flex flex-1">
                <aside className="hidden w-60 shrink-0 bg-white p-6 lg:block">
                    <div className="h-8 w-24 rounded bg-zinc-100" />

                    <div className="mt-8 space-y-5">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <div
                                key={index}
                                className="h-10 rounded-lg bg-zinc-100"
                            />
                        ))}
                    </div>
                </aside>

                <main className="flex-1 bg-white p-6">
                    <div className="h-8 w-48 rounded bg-zinc-100" />
                    <div className="mt-6 h-32 rounded-lg bg-zinc-100" />
                </main>
            </div>
        </div>
    );
}

async function DashboardContent({children}: {children: ReactNode}) {
    await connection();

    const storeGateway = createSupabaseStoreGateway();
    const store = await storeGateway.getCurrentUserStore();

    if (!store) {
        redirect("/setup-store");
    }

    return (
        <AppShell
            storeName={store.name}
            storeIdentity={<StoreIdentity storeName={store.name} />}
        >
            {children}
        </AppShell>
    );
}

export default function DashboardLayout({children}: {children: ReactNode}) {
    return (
        <Suspense fallback={<DashboardSkeleton />}>
            <DashboardContent>{children}</DashboardContent>
        </Suspense>
    );
}
