
"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    Menu01Icon,
    Search01Icon,
    Notification02Icon,
    ArrowDown01Icon,
} from "@hugeicons/core-free-icons";
import { signOutAction } from "@/app/actions/auth";

interface HeaderProps {
    onMenuClick: () => void;
    storeName: string;
}

export function Header({ onMenuClick, storeName }: HeaderProps) {
    const [accountMenuOpen, setAccountMenuOpen] = useState(false);

    const storeInitial = storeName.trim().charAt(0).toUpperCase() || "L";

    return (
        <header className="flex h-16 shrink-0 items-center justify-between bg-white px-4 sm:px-6">
            {/* Left */}
            <div className="flex items-center gap-4">
                <button
                    type="button"
                    onClick={onMenuClick}
                    aria-label="Abrir menu"
                    className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-700 transition-colors hover:bg-zinc-100 lg:hidden"
                >
                    <HugeiconsIcon icon={Menu01Icon} size={22} />
                </button>

                <span className="font-logo text-2xl italic tracking-[-0.07em] text-zinc-950 sm:hidden">
                    Footr
                </span>
            </div>

            {/* Search */}
            <div className="mx-6 hidden w-full max-w-140 items-center sm:flex">
                <div className="flex h-10 w-full items-center overflow-hidden rounded-full bg-zinc-100 transition-colors focus-within:bg-white focus-within:ring-1 focus-within:ring-zinc-300">
                    <input
                        type="search"
                        placeholder="Pesquisar produtos, vendas..."
                        className="h-full w-full bg-transparent px-5 text-sm text-zinc-900 outline-none placeholder:text-zinc-500"
                    />

                    <button
                        type="button"
                        aria-label="Pesquisar"
                        className="flex h-full w-16 shrink-0 items-center justify-center bg-zinc-100 text-zinc-700 transition-colors hover:bg-zinc-200"
                    >
                        <HugeiconsIcon icon={Search01Icon} size={20} />
                    </button>
                </div>
            </div>

            {/* Right */}
            <div className="flex shrink-0 items-center gap-2">
                <button
                    type="button"
                    aria-label="Notificações"
                    className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-700 transition-colors hover:bg-zinc-100"
                >
                    <HugeiconsIcon icon={Notification02Icon} size={21} />
                </button>

                {/* Account menu */}
                <div className="relative ml-1">
                    <button
                        type="button"
                        aria-label="Menu da loja"
                        aria-expanded={accountMenuOpen}
                        onClick={() => setAccountMenuOpen((open) => !open)}
                        className="flex items-center gap-2 rounded-full p-1 transition-colors hover:bg-zinc-100"
                    >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-950 text-xs font-semibold text-white">
                            {storeInitial}
                        </div>

                        <HugeiconsIcon
                            icon={ArrowDown01Icon}
                            size={16}
                            className={`hidden text-zinc-500 transition-transform sm:block ${accountMenuOpen ? "rotate-180" : ""
                                }`}
                        />
                    </button>

                    {accountMenuOpen && (
                        <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl bg-white py-2 shadow-lg ring-1 ring-zinc-200">
                            <div className="px-4 py-3">
                                <p className="truncate text-sm font-semibold text-zinc-950">
                                    {storeName}
                                </p>
                                <p className="mt-1 text-xs text-zinc-500">
                                    Loja ativa
                                </p>
                            </div>

                            <div className="my-1 h-px bg-zinc-100" />

                            <form action={signOutAction}>
                                <button
                                    type="submit"
                                    className="flex h-10 w-full items-center px-4 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-950"
                                >
                                    Sair
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
