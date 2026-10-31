import { HugeiconsIcon } from "@hugeicons/react";
import { Settings01Icon } from "@hugeicons/core-free-icons";

export default function SettingsPage() {
    return (
        <main className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-700">
                <HugeiconsIcon
                    icon={Settings01Icon}
                    size={26}
                    strokeWidth={1.6}
                />
            </div>

            <span className="mt-6 text-xs font-medium uppercase tracking-widest text-zinc-400">
                Em desenvolvimento
            </span>

            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-950">
                Configurações
            </h1>

            <p className="mt-3 max-w-sm text-sm leading-6 text-zinc-500">
                Estamos preparando essa área para você personalizar e
                gerenciar sua loja. As configurações estarão disponíveis
                em breve.
            </p>

            <span className="mt-8 rounded-full bg-zinc-100 px-4 py-2 text-xs font-medium text-zinc-600">
                Footr Alfa 0.1
            </span>
        </main>
    );
}
