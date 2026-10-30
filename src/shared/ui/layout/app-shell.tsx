
"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Header } from "./header";

interface AppShellProps {
    children: ReactNode;
    storeIdentity: ReactNode;
    storeName: string;
}

export function AppShell({ children, storeIdentity, storeName }: AppShellProps) {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    function closeMobileMenu() {
        setMobileMenuOpen(false);
    }

    return (
        <div className="flex min-h-screen">
            <div className="hidden lg:block">
                <Sidebar
                    pathname={pathname}
                    storeIdentity={storeIdentity}
                />
            </div>

            {mobileMenuOpen && (
                <div className="fixed inset-0 z-50 flex lg:hidden">
                    <button
                        type="button"
                        aria-label="Fechar menu"
                        onClick={closeMobileMenu}
                        className="absolute inset-0 bg-zinc-950/30"
                    />

                    <div className="relative z-10 h-full">
                        <Sidebar
                            pathname={pathname}
                            storeIdentity={storeIdentity}
                            onNavigate={closeMobileMenu}
                        />
                    </div>
                </div>
            )}

            <div className="flex min-w-0 flex-1 flex-col">
                <Header
                    onMenuClick={() => setMobileMenuOpen(true)}
                    storeName={storeName}
                />

                <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
