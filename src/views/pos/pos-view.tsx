
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { HugeiconsIcon } from "@hugeicons/react";
import {
    Search01Icon,
    ScanLine,
    ShoppingBag03Icon,
    PlusSignIcon,
    Delete02Icon,
    Cancel01Icon,
    ArrowRight01Icon,
} from "@hugeicons/core-free-icons";

import type { Product } from "@/modules/products/domain/product";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { completeSaleAction } from "@/features/checkout/complete-sale";
import { CheckoutPanel } from "@/views/pos/checkout-panel";

interface PosViewProps {
    products: Product[];
}

interface CartItem {
    product: Product;
    quantity: number;
}

export function PosView({ products }: PosViewProps) {
    const router = useRouter();

    const [availableProducts, setAvailableProducts] = useState<Product[]>(
        () => products.filter((product) => product.status === "available"),
    );

    const [search, setSearch] = useState("");
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [feedback, setFeedback] = useState<string | null>(null);

    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [scannerError, setScannerError] = useState<string | null>(null);

    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);

    // Sincroniza os produtos quando o servidor atualiza as props.
    useEffect(() => {
        setAvailableProducts(
            products.filter((product) => product.status === "available"),
        );
    }, [products]);

    const filteredProducts = useMemo(() => {
        const searchValue = search.trim().toLowerCase();

        const matchingProducts = !searchValue
            ? availableProducts
            : availableProducts.filter((product) =>
                [
                    product.footrCode,
                    product.teamName,
                    product.season,
                    product.type,
                    product.version,
                    product.size,
                ].some((value) =>
                    value.toLowerCase().includes(searchValue),
                ),
            );

        return matchingProducts.slice(0, 5);
    }, [availableProducts, search]);

    const cartCount = cart.length;

    const cartTotal = cart.reduce(
        (total, item) => total + item.product.salePrice,
        0,
    );

    const formattedPrice = (value: number) =>
        new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(value);

    function addToCart(product: Product) {
        const isAvailable = availableProducts.some(
            (item) => item.id === product.id,
        );

        if (product.status !== "available" || !isAvailable) return;

        const alreadyAdded = cart.some(
            (item) => item.product.id === product.id,
        );

        if (alreadyAdded) {
            setFeedback("Esta camisa já está no carrinho.");
            return;
        }

        setCart((current) => [
            ...current,
            { product, quantity: 1 },
        ]);

        setFeedback(`${product.teamName} adicionada ao carrinho.`);
    }

    function handleSearchSubmit() {
        const searchValue = search.trim();

        if (!searchValue) return;

        const exactMatch = availableProducts.find(
            (product) =>
                product.footrCode.toLowerCase() ===
                searchValue.toLowerCase(),
        );

        if (exactMatch) {
            addToCart(exactMatch);
            setSearch("");
            return;
        }

        if (filteredProducts.length === 0) {
            setFeedback(
                "Nenhum produto encontrado. Confira o código ou tente outra busca.",
            );
            return;
        }

        if (filteredProducts.length === 1) {
            addToCart(filteredProducts[0]);
            setSearch("");
            return;
        }

        setFeedback(
            "Mais de um produto encontrado. Selecione o produto desejado.",
        );
    }

    function removeFromCart(productId: string) {
        setCart((current) =>
            current.filter((item) => item.product.id !== productId),
        );
    }

    function openCheckout() {
        if (cart.length === 0) return;

        setIsCartOpen(false);
        setIsCheckoutOpen(true);
    }

    async function handleCompleteSale(input: {
        productIds: string[];
        paymentMethod:
        | "installment"
        | "credit"
        | "debit"
        | "pix"
        | "cash";
        customerName?: string;
        discountType: "fixed" | "percentage";
        discountValue: number;
    }) {
        try {
            const result = await completeSaleAction({
                productIds: input.productIds,
                paymentMethod: input.paymentMethod,
                customerName: input.customerName,
                discountType: input.discountType,
                discountValue: input.discountValue,
            });

            if (!result.success) {
                return {
                    success: false,
                    error: result.error,
                };
            }

            // Remove os produtos vendidos imediatamente do PDV.
            setAvailableProducts((current) =>
                current.filter(
                    (product) => !input.productIds.includes(product.id),
                ),
            );

            setCart([]);
            setSearch("");
            setIsCartOpen(false);

            setFeedback(
                `Venda #${result.saleId.slice(0, 8)} finalizada com sucesso.`,
            );

            router.refresh();

            return {
                success: true,
            };
        } catch {
            return {
                success: false,
                error: "Não foi possível finalizar a venda. Tente novamente.",
            };
        }
    }

    function handleCheckoutBack() {
        setIsCheckoutOpen(false);
    }

    useEffect(() => {
        if (!isScannerOpen || !videoRef.current) return;

        const reader = new BrowserMultiFormatReader();
        let active = true;
        let controls: { stop: () => void } | undefined;

        async function startScanner() {
            try {
                controls = await reader.decodeFromVideoDevice(
                    undefined,
                    videoRef.current!,
                    (result) => {
                        if (!active || !result) return;

                        const scannedCode = result.getText().trim();

                        if (!scannedCode) return;

                        controls?.stop();
                        setIsScannerOpen(false);

                        const product = availableProducts.find(
                            (item) =>
                                item.footrCode.toLowerCase() ===
                                scannedCode.toLowerCase(),
                        );

                        if (product) {
                            addToCart(product);
                            setSearch("");
                        } else {
                            setFeedback(
                                `Nenhum produto encontrado para o código ${scannedCode}.`,
                            );
                        }
                    },
                );
            } catch {
                if (active) {
                    setScannerError(
                        "Não foi possível acessar a câmera. Verifique as permissões do navegador.",
                    );
                }
            }
        }

        startScanner();

        return () => {
            active = false;
            controls?.stop();
        };
    }, [isScannerOpen, availableProducts]);

    if (isCheckoutOpen) {
        return (
            <CheckoutPanel
                products={cart.map((item) => item.product)}
                onBack={handleCheckoutBack}
                onComplete={handleCompleteSale}
            />
        );
    }

    return (
        <main className="min-h-screen pb-28 lg:pb-8">
            <header className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
                            PDV
                        </h1>

                        <p className="mt-1 text-sm text-zinc-500">
                            Encontre produtos e registre suas vendas.
                        </p>
                    </div>

                    <div className="hidden items-center gap-2 text-sm text-zinc-500 sm:flex">
                        <HugeiconsIcon
                            icon={ShoppingBag03Icon}
                            size={18}
                            strokeWidth={1.8}
                        />
                        {cartCount} itens no carrinho
                    </div>
                </div>
            </header>

            <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
                <section className="min-w-0">
                    <div className="mb-6">
                        <form
                            onSubmit={(event) => {
                                event.preventDefault();
                                handleSearchSubmit();
                            }}
                            className="flex h-12 items-center gap-3 rounded-full bg-zinc-100 px-5"
                        >
                            <HugeiconsIcon
                                icon={Search01Icon}
                                size={20}
                                strokeWidth={1.8}
                                className="shrink-0 text-zinc-500"
                            />

                            <input
                                type="search"
                                value={search}
                                onChange={(event) => {
                                    setSearch(event.target.value);
                                    setFeedback(null);
                                }}
                                placeholder="Buscar time, temporada ou código Footr..."
                                autoComplete="off"
                                className="h-full min-w-0 flex-1 bg-transparent text-sm text-zinc-950 outline-none placeholder:text-zinc-400"
                            />

                            {search && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearch("");
                                        setFeedback(null);
                                    }}
                                    aria-label="Limpar busca"
                                    className="flex size-8 shrink-0 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-zinc-950"
                                >
                                    <HugeiconsIcon
                                        icon={Cancel01Icon}
                                        size={18}
                                        strokeWidth={1.8}
                                    />
                                </button>
                            )}
                        </form>

                        <button
                            type="button"
                            onClick={() => {
                                setScannerError(null);
                                setIsScannerOpen(true);
                            }}
                            className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-zinc-950 px-5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 sm:w-auto"
                        >
                            <HugeiconsIcon
                                icon={ScanLine}
                                size={19}
                                strokeWidth={1.8}
                            />
                            Escanear código
                        </button>

                        {feedback && (
                            <p
                                role="status"
                                className="mt-3 text-xs text-zinc-500"
                            >
                                {feedback}
                            </p>
                        )}
                    </div>

                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-zinc-950">
                            Produtos disponíveis
                        </h2>

                        <span className="text-xs text-zinc-500">
                            {availableProducts.length} produtos
                        </span>
                    </div>

                    {filteredProducts.length === 0 ? (
                        <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
                            <HugeiconsIcon
                                icon={Search01Icon}
                                size={28}
                                strokeWidth={1.5}
                                className="mb-3 text-zinc-400"
                            />

                            <p className="text-sm font-medium text-zinc-950">
                                {search
                                    ? "Nenhum produto encontrado"
                                    : "Nenhum produto disponível"}
                            </p>

                            <p className="mt-1 max-w-xs text-xs text-zinc-500">
                                {search
                                    ? "Confira o código, time ou temporada e tente novamente."
                                    : "Os produtos cadastrados e disponíveis para venda aparecerão aqui."}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-zinc-100">
                            {filteredProducts.map((product) => {
                                const isInCart = cart.some(
                                    (item) =>
                                        item.product.id === product.id,
                                );

                                return (
                                    <div
                                        key={product.id}
                                        className="flex items-center gap-3 py-4"
                                    >
                                        <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-zinc-100">
                                            <HugeiconsIcon
                                                icon={ShoppingBag03Icon}
                                                size={23}
                                                strokeWidth={1.5}
                                                className="text-zinc-400"
                                            />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold text-zinc-950">
                                                {product.teamName}
                                            </p>

                                            <p className="mt-1 text-xs text-zinc-500">
                                                {product.season} · {product.type}
                                            </p>

                                            <p className="mt-1 text-xs text-zinc-500">
                                                {product.size} · {product.version}
                                            </p>

                                            <p className="mt-1 text-xs text-zinc-400">
                                                {product.footrCode}
                                            </p>
                                        </div>

                                        <div className="flex shrink-0 flex-col items-end gap-2">
                                            <p className="text-sm font-semibold text-zinc-950">
                                                {formattedPrice(product.salePrice)}
                                            </p>

                                            <button
                                                type="button"
                                                onClick={() => addToCart(product)}
                                                disabled={isInCart}
                                                aria-label="Adicionar ao carrinho"
                                                className="flex size-9 items-center justify-center rounded-full bg-zinc-950 text-white transition-colors hover:bg-zinc-800 disabled:bg-zinc-200 disabled:text-zinc-400"
                                            >
                                                <HugeiconsIcon
                                                    icon={PlusSignIcon}
                                                    size={19}
                                                    strokeWidth={1.8}
                                                />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                <aside className="hidden lg:block">
                    <div className="sticky top-6">
                        <CartContent
                            cart={cart}
                            cartTotal={cartTotal}
                            formattedPrice={formattedPrice}
                            onRemove={removeFromCart}
                            onCheckout={openCheckout}
                        />
                    </div>
                </aside>
            </div>

            <div className="fixed inset-x-0 bottom-0 z-30 bg-white/95 p-4 backdrop-blur-sm lg:hidden">
                <button
                    type="button"
                    onClick={() => setIsCartOpen(true)}
                    className="flex h-12 w-full items-center justify-between rounded-full bg-zinc-950 px-5 text-white transition-colors hover:bg-zinc-800"
                >
                    <span className="flex items-center gap-2 text-sm font-medium">
                        <HugeiconsIcon
                            icon={ShoppingBag03Icon}
                            size={19}
                            strokeWidth={1.8}
                        />
                        Carrinho ({cartCount})
                    </span>

                    <span className="flex items-center gap-3">
                        <span className="text-sm font-semibold">
                            {formattedPrice(cartTotal)}
                        </span>

                        <HugeiconsIcon
                            icon={ArrowRight01Icon}
                            size={18}
                            strokeWidth={1.8}
                        />
                    </span>
                </button>
            </div>

            {isCartOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-end bg-black/40 lg:hidden"
                    onClick={(event) => {
                        if (event.target === event.currentTarget) {
                            setIsCartOpen(false);
                        }
                    }}
                >
                    <div className="max-h-[85vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5">
                        <div className="mb-5 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-zinc-950">
                                Carrinho
                            </h2>

                            <button
                                type="button"
                                onClick={() => setIsCartOpen(false)}
                                aria-label="Fechar carrinho"
                                className="flex size-9 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-100"
                            >
                                <HugeiconsIcon
                                    icon={Cancel01Icon}
                                    size={20}
                                    strokeWidth={1.8}
                                />
                            </button>
                        </div>

                        <CartContent
                            cart={cart}
                            cartTotal={cartTotal}
                            formattedPrice={formattedPrice}
                            onRemove={removeFromCart}
                            onCheckout={openCheckout}
                        />
                    </div>
                </div>
            )}

            {isScannerOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
                    <div className="w-full max-w-md rounded-3xl bg-white p-5">
                        <div className="mb-5 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-zinc-950">
                                Escanear produto
                            </h2>

                            <button
                                type="button"
                                onClick={() => setIsScannerOpen(false)}
                                aria-label="Fechar scanner"
                                className="flex size-9 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100"
                            >
                                <HugeiconsIcon
                                    icon={Cancel01Icon}
                                    size={20}
                                    strokeWidth={1.8}
                                />
                            </button>
                        </div>

                        <div className="overflow-hidden rounded-2xl bg-black">
                            <video
                                ref={videoRef}
                                className="aspect-square w-full object-cover"
                                muted
                                playsInline
                            />
                        </div>

                        <p className="mt-4 text-center text-sm text-zinc-500">
                            Posicione o QR Code ou código de barras dentro da câmera.
                        </p>

                        {scannerError && (
                            <p className="mt-3 text-center text-sm text-red-600">
                                {scannerError}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </main>
    );
}

interface CartContentProps {
    cart: CartItem[];
    cartTotal: number;
    formattedPrice: (value: number) => string;
    onRemove: (productId: string) => void;
    onCheckout: () => void;
}

function CartContent({
    cart,
    cartTotal,
    formattedPrice,
    onRemove,
    onCheckout,
}: CartContentProps) {
    return (
        <div>
            <div className="mb-5 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-zinc-950">
                    Carrinho
                </h2>

                <span className="text-xs text-zinc-500">
                    {cart.length} produtos
                </span>
            </div>

            {cart.length === 0 ? (
                <div className="py-12 text-center">
                    <HugeiconsIcon
                        icon={ShoppingBag03Icon}
                        size={28}
                        strokeWidth={1.5}
                        className="mx-auto mb-3 text-zinc-400"
                    />

                    <p className="text-sm font-medium text-zinc-950">
                        Seu carrinho está vazio
                    </p>

                    <p className="mt-1 text-xs text-zinc-500">
                        Adicione produtos para iniciar uma venda.
                    </p>
                </div>
            ) : (
                <div className="divide-y divide-zinc-100">
                    {cart.map((item) => (
                        <div
                            key={item.product.id}
                            className="flex gap-3 py-4"
                        >
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-zinc-950">
                                    {item.product.teamName}
                                </p>

                                <p className="mt-1 text-xs text-zinc-500">
                                    {item.product.season} · {item.product.size}
                                </p>

                                <p className="mt-2 text-sm font-semibold text-zinc-950">
                                    {formattedPrice(item.product.salePrice)}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => onRemove(item.product.id)}
                                aria-label="Remover produto"
                                className="flex size-8 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-950"
                            >
                                <HugeiconsIcon
                                    icon={Delete02Icon}
                                    size={18}
                                    strokeWidth={1.8}
                                />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-5 border-t border-zinc-200 pt-5">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-500">
                        Total
                    </span>

                    <span className="text-xl font-semibold tracking-tight text-zinc-950">
                        {formattedPrice(cartTotal)}
                    </span>
                </div>

                <button
                    type="button"
                    onClick={onCheckout}
                    disabled={cart.length === 0}
                    className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-zinc-950 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-400"
                >
                    Continuar para pagamento
                    <HugeiconsIcon
                        icon={ArrowRight01Icon}
                        size={18}
                        strokeWidth={1.8}
                    />
                </button>
            </div>
        </div>
    );
}
