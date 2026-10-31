import type { Product } from "@/modules/products/domain/product";

import { UpdateProductDialog } from "@/features/products/ui/update-product-dialog";
import { ExportProductsButton } from "@/features/products/ui/export-products-button";

interface ProductTableProps {
    products: Product[];
}

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
});

function ProductStatusBadge({ status }: { status: Product["status"] }) {
    const labels = {
        available: "Disponível",
        sold: "Vendido",
        archived: "Arquivado",
    };

    const styles = {
        available: "bg-green-50 text-green-700",
        sold: "bg-zinc-100 text-zinc-600",
        archived: "bg-orange-50 text-orange-700",
    };

    return (
        <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${styles[status]}`}
        >
            {labels[status]}
        </span>
    );
}

function ShirtPlaceholder() {
    return (
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-zinc-100">
            <svg
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7 text-zinc-400"
                aria-hidden="true"
            >
                <path
                    d="M15 8L7 12L3 22L11 26L15 20V40H33V20L37 26L41 12L33 8C31 11 28 13 24 13C20 13 17 11 15 8Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                />
            </svg>
        </div>
    );
}

export function ProductTable({ products }: ProductTableProps) {
    return (
        <div className="space-y-4">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <span className="text-xs text-zinc-500">
                    {products.length} produtos
                </span>

                <ExportProductsButton />
            </div>

            {products.length === 0 ? (
                <div className="py-16 text-center">
                    <p className="text-sm font-medium text-zinc-900">
                        Nenhum produto cadastrado
                    </p>

                    <p className="mt-1 text-sm text-zinc-500">
                        Cadastre um produto ou importe sua planilha para começar.
                    </p>
                </div>
            ) : (
                <div className="w-full overflow-x-auto">
                    <table className="w-full min-w-225 text-left text-sm">
                        <thead>
                            <tr className="border-b border-zinc-200 text-xs text-zinc-500">
                                <th className="w-16 px-4 py-3 font-medium">
                                    Produto
                                </th>

                                <th className="px-4 py-3 font-medium">
                                    Identificação
                                </th>

                                <th className="px-4 py-3 font-medium">
                                    Versão
                                </th>

                                <th className="px-4 py-3 font-medium">
                                    Tamanho
                                </th>

                                <th className="px-4 py-3 text-right font-medium">
                                    Custo
                                </th>

                                <th className="px-4 py-3 text-right font-medium">
                                    Venda
                                </th>

                                <th className="px-4 py-3 font-medium">
                                    Status
                                </th>

                                <th className="w-32 px-4 py-3 text-right font-medium">
                                    Ações
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-zinc-100">
                            {products.map((product) => (
                                <tr key={product.id} className="text-zinc-700">
                                    <td className="px-4 py-3">
                                        <ShirtPlaceholder />
                                    </td>

                                    <td className="px-4 py-3">
                                        <p className="font-medium text-zinc-950">
                                            {product.teamName} {product.season} {product.type}
                                        </p>

                                        <p className="mt-1 font-mono text-xs text-zinc-400">
                                            {product.footrCode}
                                        </p>
                                    </td>

                                    <td className="whitespace-nowrap px-4 py-3">
                                        {product.version}
                                    </td>

                                    <td className="whitespace-nowrap px-4 py-3">
                                        {product.size}
                                    </td>

                                    <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">
                                        {currencyFormatter.format(product.costPrice)}
                                    </td>

                                    <td className="whitespace-nowrap px-4 py-3 text-right font-medium tabular-nums text-zinc-950">
                                        {currencyFormatter.format(product.salePrice)}
                                    </td>

                                    <td className="whitespace-nowrap px-4 py-3">
                                        <ProductStatusBadge status={product.status} />
                                    </td>

                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end">
                                            <UpdateProductDialog product={product} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}