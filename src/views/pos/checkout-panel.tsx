"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { HugeiconsIcon } from "@hugeicons/react";
import {
    ArrowLeft01Icon,
    ArrowRight01Icon,
    CheckmarkCircle02Icon,
    CreditCardIcon,
    Money01Icon,
    Tick02Icon,
    UserIcon,
    Wallet01Icon,
} from "@hugeicons/core-free-icons";

import type { Product } from "@/modules/products/domain/product";
import type { PaymentMethod } from "@/modules/sales/domain/sale";

type DiscountType = "fixed" | "percentage";

interface CheckoutResult {
    success: boolean;
    error?: string;
}

interface CheckoutPanelProps {
    products: Product[];
    onBack: () => void;
    onComplete: (input: {
        productIds: string[];
        paymentMethod: PaymentMethod;
        customerName?: string;
        discountType: DiscountType;
        discountValue: number;
    }) => Promise<CheckoutResult>;
}

const PAYMENT_OPTIONS = [
    {
        value: "pix",
        label: "Pix",
        description: "Pagamento instantâneo",
        icon: Money01Icon,
    },
    {
        value: "cash",
        label: "Dinheiro",
        description: "Pagamento em espécie",
        icon: Wallet01Icon,
    },
    {
        value: "credit",
        label: "Crédito",
        description: "Cartão de crédito",
        icon: CreditCardIcon,
    },
    {
        value: "debit",
        label: "Débito",
        description: "Cartão de débito",
        icon: CreditCardIcon,
    },
    {
        value: "installment",
        label: "Parcelado",
        description: "Pagamento parcelado",
        icon: CreditCardIcon,
    },
] satisfies {
    value: PaymentMethod;
    label: string;
    description: string;
    icon: typeof CreditCardIcon;
}[];

function formatPrice(value: number) {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(value);
}

function parseDiscount(value: string) {
    const normalized = value.trim();

    if (!normalized) return 0;

    const parsed = normalized.includes(",")
        ? Number(
            normalized
                .replace(/\./g, "")
                .replace(",", "."),
        )
        : Number(normalized);

    return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

function playFeedbackSound(success: boolean) {
    try {
        const AudioContextClass =
            window.AudioContext ||
            (window as typeof window & {
                webkitAudioContext?: typeof AudioContext;
            }).webkitAudioContext;

        if (!AudioContextClass) return;

        const audioContext = new AudioContextClass();
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();

        oscillator.connect(gain);
        gain.connect(audioContext.destination);

        const now = audioContext.currentTime;

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(
            success ? 660 : 220,
            now,
        );

        if (success) {
            oscillator.frequency.setValueAtTime(880, now + 0.12);
        }

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.15, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(
            0.0001,
            now + (success ? 0.35 : 0.25),
        );

        oscillator.start(now);
        oscillator.stop(now + (success ? 0.36 : 0.26));

        oscillator.onended = () => {
            void audioContext.close();
        };
    } catch {
        // O feedback sonoro não deve interromper a venda.
    }
}

export function CheckoutPanel({
    products,
    onBack,
    onComplete,
}: CheckoutPanelProps) {
    const [customerName, setCustomerName] = useState("");
    const [paymentMethod, setPaymentMethod] =
        useState<PaymentMethod | null>(null);

    const [discountType, setDiscountType] =
        useState<DiscountType>("fixed");
    const [discountInput, setDiscountInput] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState<CheckoutResult | null>(null);
    const [confirmedTotal, setConfirmedTotal] = useState<number | null>(null);

    const hasCelebrated = useRef(false);

    useEffect(() => {
        if (!feedback?.success || hasCelebrated.current) return;

        hasCelebrated.current = true;

        void import("canvas-confetti")
            .then(({ default: confetti }) => {
                confetti({
                    particleCount: 85,
                    spread: 75,
                    startVelocity: 32,
                    gravity: 0.9,
                    scalar: 0.9,
                    origin: { x: 0.5, y: 0.58 },
                    colors: [
                        "#16a34a",
                        "#2563eb",
                        "#a855f7",
                        "#f59e0b",
                        "#18181b",
                    ],
                });

                confetti({
                    particleCount: 30,
                    angle: 60,
                    spread: 50,
                    startVelocity: 28,
                    origin: { x: 0.1, y: 0.65 },
                    colors: ["#16a34a", "#2563eb", "#a855f7"],
                });

                confetti({
                    particleCount: 30,
                    angle: 120,
                    spread: 50,
                    startVelocity: 28,
                    origin: { x: 0.9, y: 0.65 },
                    colors: ["#16a34a", "#2563eb", "#f59e0b"],
                });
            })
            .catch(() => {
                // A animação não deve interferir na confirmação da venda.
            });
    }, [feedback]);

    const subtotal = useMemo(
        () =>
            products.reduce(
                (total, product) => total + product.salePrice,
                0,
            ),
        [products],
    );

    const discountValue = parseDiscount(discountInput);

    const discountAmount = useMemo(() => {
        const amount =
            discountType === "percentage"
                ? subtotal * (discountValue / 100)
                : discountValue;

        return Math.round(
            Math.min(subtotal, Math.max(0, amount)) * 100,
        ) / 100;
    }, [discountType, discountValue, subtotal]);

    const total = Math.max(0, subtotal - discountAmount);

    function handleDiscountTypeChange(type: DiscountType) {
        setDiscountType(type);
        setDiscountInput("");
    }

    async function handleComplete() {
        if (
            isSubmitting ||
            !paymentMethod ||
            products.length === 0 ||
            (discountType === "percentage" && discountValue > 100)
        ) {
            return;
        }

        setIsSubmitting(true);
        setFeedback(null);

        try {
            const result = await onComplete({
                productIds: products.map((product) => product.id),
                paymentMethod,
                customerName,
                discountType,
                discountValue,
            });

            if (result.success) {
                setConfirmedTotal(total);
            }

            setFeedback(result);
            playFeedbackSound(result.success);
        } catch {
            const errorResult = {
                success: false,
                error: "Não foi possível finalizar a venda. Tente novamente.",
            };

            setFeedback(errorResult);
            playFeedbackSound(false);
        } finally {
            setIsSubmitting(false);
        }
    }


    if (feedback?.success) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-white p-6">
                <style>{`
                @keyframes success-pop {
                    0% {
                        opacity: 0;
                        transform: scale(0.55);
                    }
                    65% {
                        opacity: 1;
                        transform: scale(1.12);
                    }
                    100% {
                        opacity: 1;
                        transform: scale(1);
                    }
                }

                @keyframes tick-enter {
                    0% {
                        opacity: 0;
                        transform: scale(0.4) rotate(-20deg);
                    }
                    70% {
                        opacity: 1;
                        transform: scale(1.15) rotate(4deg);
                    }
                    100% {
                        opacity: 1;
                        transform: scale(1) rotate(0);
                    }
                }

                @keyframes success-content {
                    from {
                        opacity: 0;
                        transform: translateY(14px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>

                <div className="flex w-full max-w-sm flex-col items-center text-center">
                    <div className="mb-8 flex size-16 items-center justify-center rounded-full bg-green-100 animate-[success-pop_650ms_cubic-bezier(0.16,1,0.3,1)_both]">
                        <HugeiconsIcon
                            icon={Tick02Icon}
                            size={30}
                            className="text-green-600 animate-[tick-enter_500ms_cubic-bezier(0.16,1,0.3,1)_150ms_both]"
                            strokeWidth={2}
                        />
                    </div>

                    <div className="w-full animate-[success-content_500ms_ease-out_200ms_both]">
                        <h2 className="text-2xl font-semibold tracking-tight text-zinc-950">
                            Venda confirmada!
                        </h2>

                        <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                            O pagamento foi registrado e os produtos foram
                            atualizados no estoque.
                        </p>

                        <p className="mt-6 text-3xl font-semibold tracking-tight text-zinc-950">
                            {formatPrice(confirmedTotal ?? total)}
                        </p>

                        <button
                            type="button"
                            onClick={onBack}
                            className="mt-8 flex h-12 w-full items-center justify-center rounded-full bg-zinc-950 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
                        >
                            Voltar ao PDV
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (feedback && !feedback.success) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-white p-6">
                <div className="flex w-full max-w-sm flex-col items-center text-center animate-[checkout-enter_400ms_ease-out]">
                    <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-zinc-100">
                        <HugeiconsIcon
                            icon={CheckmarkCircle02Icon}
                            size={44}
                            strokeWidth={1.8}
                            className="rotate-180 text-zinc-950"
                        />
                    </div>

                    <h2 className="text-2xl font-semibold tracking-tight text-zinc-950">
                        Não foi possível concluir
                    </h2>

                    <p className="mt-2 text-sm text-zinc-500">
                        {feedback.error ||
                            "Ocorreu um erro ao registrar a venda."}
                    </p>

                    <button
                        type="button"
                        onClick={() => setFeedback(null)}
                        className="mt-8 flex h-12 w-full items-center justify-center rounded-full bg-zinc-950 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
                    >
                        Tentar novamente
                    </button>

                    <button
                        type="button"
                        onClick={onBack}
                        className="mt-3 text-sm font-medium text-zinc-500 hover:text-zinc-950"
                    >
                        Voltar ao PDV
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-white">
            <div className="mx-auto min-h-screen w-full max-w-3xl px-5 py-6 sm:px-8">
                <header className="mb-8 flex items-center justify-between">
                    <button
                        type="button"
                        onClick={onBack}
                        disabled={isSubmitting}
                        className="flex items-center gap-2 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-950 disabled:opacity-50"
                    >
                        <HugeiconsIcon
                            icon={ArrowLeft01Icon}
                            size={19}
                            strokeWidth={1.8}
                        />
                        Voltar ao PDV
                    </button>

                    <span className="text-sm font-semibold text-zinc-950">
                        Checkout
                    </span>
                </header>

                <div className="mb-8">
                    <h2 className="text-2xl font-semibold tracking-tight text-zinc-950">
                        Finalizar venda
                    </h2>

                    <p className="mt-2 text-sm text-zinc-500">
                        Confira os produtos e escolha a forma de pagamento.
                    </p>
                </div>

                <div className="grid gap-10 md:grid-cols-[1fr_280px]">
                    <section className="min-w-0 space-y-8">
                        <div>
                            <h3 className="mb-4 text-sm font-semibold text-zinc-950">
                                Identificação do cliente
                            </h3>

                            <div className="flex h-12 items-center gap-3 rounded-xl bg-zinc-100 px-4">
                                <HugeiconsIcon
                                    icon={UserIcon}
                                    size={19}
                                    strokeWidth={1.8}
                                    className="shrink-0 text-zinc-400"
                                />

                                <input
                                    type="text"
                                    value={customerName}
                                    onChange={(event) =>
                                        setCustomerName(event.target.value)
                                    }
                                    placeholder="Nome do cliente (opcional)"
                                    maxLength={120}
                                    disabled={isSubmitting}
                                    className="h-full min-w-0 flex-1 bg-transparent text-sm text-zinc-950 outline-none placeholder:text-zinc-400"
                                />
                            </div>
                        </div>

                        <div>
                            <h3 className="mb-1 text-sm font-semibold text-zinc-950">
                                Forma de pagamento
                            </h3>

                            <p className="mb-4 text-xs text-zinc-500">
                                Selecione uma única forma de pagamento.
                            </p>

                            <div className="grid gap-2 sm:grid-cols-2">
                                {PAYMENT_OPTIONS.map((option) => {
                                    const isSelected =
                                        paymentMethod === option.value;

                                    return (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() =>
                                                setPaymentMethod(option.value)
                                            }
                                            disabled={isSubmitting}
                                            aria-pressed={isSelected}
                                            className={`flex min-h-19 items-center gap-3 rounded-xl p-4 text-left transition-colors ${isSelected
                                                ? "bg-zinc-950 text-white"
                                                : "bg-zinc-100 text-zinc-950 hover:bg-zinc-200"
                                                }`}
                                        >
                                            <HugeiconsIcon
                                                icon={option.icon}
                                                size={22}
                                                strokeWidth={1.8}
                                                className={
                                                    isSelected
                                                        ? "text-white"
                                                        : "text-zinc-500"
                                                }
                                            />

                                            <span className="min-w-0 flex-1">
                                                <span className="block text-sm font-semibold">
                                                    {option.label}
                                                </span>

                                                <span
                                                    className={`mt-1 block text-xs ${isSelected
                                                        ? "text-zinc-300"
                                                        : "text-zinc-500"
                                                        }`}
                                                >
                                                    {option.description}
                                                </span>
                                            </span>

                                            {isSelected && (
                                                <HugeiconsIcon
                                                    icon={CheckmarkCircle02Icon}
                                                    size={19}
                                                    strokeWidth={2}
                                                    className="shrink-0 text-white"
                                                />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <h3 className="mb-1 text-sm font-semibold text-zinc-950">
                                Desconto
                            </h3>

                            <p className="mb-4 text-xs text-zinc-500">
                                Escolha como deseja aplicar o desconto.
                            </p>

                            <div className="mb-3 flex rounded-full bg-zinc-100 p-1">
                                <button
                                    type="button"
                                    onClick={() =>
                                        handleDiscountTypeChange("fixed")
                                    }
                                    disabled={isSubmitting}
                                    className={`h-9 flex-1 rounded-full text-sm font-medium transition-colors ${discountType === "fixed"
                                        ? "bg-zinc-950 text-white"
                                        : "text-zinc-500 hover:text-zinc-950"
                                        }`}
                                >
                                    Valor em R$
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        handleDiscountTypeChange("percentage")
                                    }
                                    disabled={isSubmitting}
                                    className={`h-9 flex-1 rounded-full text-sm font-medium transition-colors ${discountType === "percentage"
                                        ? "bg-zinc-950 text-white"
                                        : "text-zinc-500 hover:text-zinc-950"
                                        }`}
                                >
                                    Porcentagem
                                </button>
                            </div>

                            <div className="flex h-12 items-center gap-3 rounded-xl bg-zinc-100 px-4">
                                <span className="text-sm font-medium text-zinc-500">
                                    {discountType === "fixed" ? "R$" : "%"}
                                </span>

                                <input
                                    type="text"
                                    inputMode="decimal"
                                    value={discountInput}
                                    onChange={(event) =>
                                        setDiscountInput(
                                            event.target.value.replace(
                                                /[^0-9.,]/g,
                                                "",
                                            ),
                                        )
                                    }
                                    placeholder="0,00"
                                    disabled={isSubmitting}
                                    className="h-full min-w-0 flex-1 bg-transparent text-sm text-zinc-950 outline-none placeholder:text-zinc-400"
                                />
                            </div>

                            {discountType === "percentage" &&
                                discountValue > 100 && (
                                    <p className="mt-2 text-xs text-red-600">
                                        O desconto não pode ultrapassar 100%.
                                    </p>
                                )}

                            <p className="mt-2 text-xs text-zinc-500">
                                Desconto aplicado: {formatPrice(discountAmount)}
                            </p>
                        </div>
                    </section>

                    <aside>
                        <h3 className="mb-4 text-sm font-semibold text-zinc-950">
                            Resumo da venda
                        </h3>

                        <div className="divide-y divide-zinc-100">
                            {products.map((product) => (
                                <div
                                    key={product.id}
                                    className="flex justify-between gap-3 py-3"
                                >
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium text-zinc-950">
                                            {product.teamName}
                                        </p>

                                        <p className="mt-1 text-xs text-zinc-500">
                                            {product.season} · {product.size}
                                        </p>
                                    </div>

                                    <p className="shrink-0 text-sm font-medium text-zinc-950">
                                        {formatPrice(product.salePrice)}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 border-t border-zinc-200 pt-4">
                            <div className="flex items-center justify-between text-sm text-zinc-500">
                                <span>Subtotal</span>
                                <span>{formatPrice(subtotal)}</span>
                            </div>

                            <div className="mt-3 flex items-center justify-between text-sm text-zinc-500">
                                <span>Desconto</span>
                                <span>- {formatPrice(discountAmount)}</span>
                            </div>

                            <div className="mt-3 flex items-center justify-between">
                                <span className="text-sm font-semibold text-zinc-950">
                                    Total
                                </span>

                                <span className="text-xl font-semibold tracking-tight text-zinc-950">
                                    {formatPrice(total)}
                                </span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleComplete}
                            disabled={
                                !paymentMethod ||
                                products.length === 0 ||
                                isSubmitting ||
                                (discountType === "percentage" &&
                                    discountValue > 100)
                            }
                            className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-zinc-950 px-5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-400"
                        >
                            {isSubmitting
                                ? "Finalizando venda..."
                                : "Finalizar venda"}

                            {!isSubmitting && (
                                <HugeiconsIcon
                                    icon={ArrowRight01Icon}
                                    size={18}
                                    strokeWidth={1.8}
                                />
                            )}
                        </button>

                        {!paymentMethod && (
                            <p className="mt-3 text-center text-xs text-zinc-400">
                                Selecione uma forma de pagamento.
                            </p>
                        )}
                    </aside>
                </div>
            </div>
        </div>
    );
}
