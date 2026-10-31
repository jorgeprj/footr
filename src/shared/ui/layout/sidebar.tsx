
"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    Home04Icon,
    PackageIcon,
    ShoppingBag03Icon,
    ReceiptTextIcon,
    ChartLineData02Icon,
    Settings02Icon,
    HelpCircleIcon,
} from "@hugeicons/core-free-icons";

const navigation = [
    { label: "Visão geral", href: "/dashboard", icon: Home04Icon },
    { label: "Produtos", href: "/products", icon: PackageIcon },
    { label: "PDV", href: "/pos", icon: ShoppingBag03Icon },
    { label: "Vendas", href: "/sales", icon: ReceiptTextIcon },
    { label: "Financeiro", href: "/finance", icon: ChartLineData02Icon },
];

const secondaryNavigation = [
    { label: "Configurações", href: "/settings", icon: Settings02Icon },
    { label: "Ajuda", href: "/blog/como-importar-produtos-automaticamente", icon: HelpCircleIcon },
];

interface SidebarProps {
    pathname: string;
    storeIdentity: ReactNode;
    onNavigate?: () => void;
}

export function Sidebar({
    pathname,
    storeIdentity,
    onNavigate,
}: SidebarProps) {
    return (
        <aside className="flex h-full w-60 shrink-0 flex-col bg-white">
            {/* Logo */}
            <div className="flex h-16 shrink-0 items-center px-6">
                <Link
                    href="/dashboard"
                    className="font-logo text-3xl italic tracking-[-0.07em] text-zinc-950"
                >
                    Footr
                </Link>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto px-3 py-2">
                <nav className="space-y-1">
                    {navigation.map((item) => {
                        const active =
                            pathname === item.href ||
                            (item.href !== "/dashboard" &&
                                pathname.startsWith(`${item.href}/`));

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={onNavigate}
                                className={`flex h-11 items-center gap-5 rounded-lg px-3 text-sm transition-colors ${active
                                        ? "bg-zinc-100 font-semibold text-zinc-950"
                                        : "font-medium text-zinc-700 hover:bg-zinc-100"
                                    }`}
                            >
                                <HugeiconsIcon
                                    icon={item.icon}
                                    size={21}
                                    strokeWidth={active ? 2 : 1.7}
                                />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="my-4 h-px bg-zinc-100" />

                <nav className="space-y-1">
                    {secondaryNavigation.map((item) => {
                        const active = pathname === item.href;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={onNavigate}
                                className={`flex h-11 items-center gap-5 rounded-lg px-3 text-sm transition-colors ${active
                                        ? "bg-zinc-100 font-semibold text-zinc-950"
                                        : "font-medium text-zinc-700 hover:bg-zinc-100"
                                    }`}
                            >
                                <HugeiconsIcon
                                    icon={item.icon}
                                    size={21}
                                    strokeWidth={active ? 2 : 1.7}
                                />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Active store */}
            <div className="shrink-0 px-3 py-3">
                {storeIdentity}
            </div>
        </aside>
    );
}
