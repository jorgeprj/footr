
import { HugeiconsIcon } from "@hugeicons/react";
import { Store01Icon } from "@hugeicons/core-free-icons";

interface StoreIdentityProps {
    storeName: string;
}

export function StoreIdentity({ storeName }: StoreIdentityProps) {
    return (
        <div className="flex items-center gap-3 px-3 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-100">
                <HugeiconsIcon
                    icon={Store01Icon}
                    size={19}
                    className="text-zinc-700"
                />
            </div>

            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-zinc-900">
                    {storeName}
                </p>
                <p className="text-xs text-zinc-500">
                    Loja ativa
                </p>
            </div>
        </div>
    );
}
