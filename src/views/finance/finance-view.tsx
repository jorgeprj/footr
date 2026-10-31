
"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    ChartBarLineIcon,
    Download01Icon,
    ArrowLeft01Icon,
} from "@hugeicons/core-free-icons";

import { generateFinancialReport } from "@/features/finance/generate-financial-report";
import { exportFinancialReport } from "@/features/finance/export-financial-report";

import type {
    FinancialPaymentMethod,
    FinancialReport,
    PaymentFees,
} from "@/modules/finance/domain/financial-report";

const PAYMENT_METHODS: {
    id: FinancialPaymentMethod;
    label: string;
    description: string;
}[] = [
    { id: "pix", label: "Pix", description: "Pagamentos via Pix" },
    { id: "cash", label: "Dinheiro", description: "Pagamentos em espécie" },
    { id: "debit", label: "Débito", description: "Cartões de débito" },
    {
        id: "credit",
        label: "Crédito à vista",
        description: "Cartões de crédito em uma parcela",
    },
    {
        id: "installment",
        label: "Crédito parcelado",
        description: "Vendas parceladas",
    },
];

type FeeInputs = Record<FinancialPaymentMethod, string>;

const INITIAL_FEES: FeeInputs = {
    pix: "0",
    cash: "0",
    debit: "0",
    credit: "0",
    installment: "0",
};

const CURRENCY_FORMATTER = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
});

function formatCurrency(value: number): string {
    return CURRENCY_FORMATTER.format(value);
}

function formatDate(value: string): string {
    return value.split("-").reverse().join("/");
}

function formatPercentage(value: number): string {
    return `${value.toLocaleString("pt-BR", {
        maximumFractionDigits: 2,
    })}%`;
}

function parseFees(inputs: FeeInputs): PaymentFees {
    return {
        pix: Number(inputs.pix.replace(",", ".")),
        cash: Number(inputs.cash.replace(",", ".")),
        debit: Number(inputs.debit.replace(",", ".")),
        credit: Number(inputs.credit.replace(",", ".")),
        installment: Number(inputs.installment.replace(",", ".")),
    };
}

function getFeeInputValue(value: string): string | null {
    const normalizedValue = value.replace(",", ".");

    if (
        normalizedValue !== "" &&
        !/^\d*\.?\d*$/.test(normalizedValue)
    ) {
        return null;
    }

    if (
        normalizedValue !== "" &&
        Number(normalizedValue) > 100
    ) {
        return null;
    }

    return value;
}

export function FinanceView() {
    const [fees, setFees] = useState<FeeInputs>(INITIAL_FEES);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const [report, setReport] = useState<FinancialReport | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function handleFeeChange(
        method: FinancialPaymentMethod,
        value: string,
    ) {
        const validValue = getFeeInputValue(value);

        if (validValue === null) return;

        setFees((current) => ({
            ...current,
            [method]: validValue,
        }));

        setError(null);
    }

    async function handleGenerateReport() {
        if (!startDate || !endDate) {
            setError("Informe o período do relatório.");
            return;
        }

        if (startDate > endDate) {
            setError("A data inicial deve ser anterior à data final.");
            return;
        }

        setIsGenerating(true);
        setError(null);

        try {
            const result = await generateFinancialReport({
                startDate,
                endDate,
                fees: parseFees(fees),
            });

            if (!result.success) {
                setError(result.error);
                return;
            }

            setReport(result.data);
        } catch {
            setError("Não foi possível gerar o relatório financeiro.");
        } finally {
            setIsGenerating(false);
        }
    }

    const indicators = report
        ? [
              {
                  label: "Vendas realizadas",
                  value: report.salesCount.toLocaleString("pt-BR"),
                  description: "Vendas concluídas no período",
              },
              {
                  label: "Receita bruta",
                  value: formatCurrency(report.grossRevenue),
                  description: "Antes dos descontos",
              },
              {
                  label: "Descontos",
                  value: formatCurrency(report.discounts),
                  description: "Descontos concedidos",
              },
              {
                  label: "Receita de vendas",
                  value: formatCurrency(report.revenue),
                  description: "Após os descontos",
              },
              {
                  label: "Taxas estimadas",
                  value: formatCurrency(report.estimatedFees),
                  description: "Custos dos meios de pagamento",
              },
              {
                  label: "Receita após taxas",
                  value: formatCurrency(report.netRevenue),
                  description: "Receita menos taxas",
              },
              {
                  label: "Custo dos produtos",
                  value: formatCurrency(report.productCosts),
                  description: "Custo registrado nas vendas",
              },
              {
                  label: "Lucro bruto",
                  value: formatCurrency(report.grossProfit),
                  description: "Receita menos custo dos produtos",
              },
          ]
        : [];

    // Após gerar o relatório, a tela de configuração é substituída.
    if (report) {
        return (
            <main className="space-y-8">
                <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-2">
                        <button
                            type="button"
                            onClick={() => setReport(null)}
                            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-950"
                        >
                            <HugeiconsIcon
                                icon={ArrowLeft01Icon}
                                size={18}
                                strokeWidth={1.8}
                            />
                            Voltar
                        </button>

                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
                                Relatório financeiro
                            </h1>

                            <p className="mt-1 text-sm text-zinc-500">
                                {formatDate(report.period.startDate)} até{" "}
                                {formatDate(report.period.endDate)}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => exportFinancialReport(report)}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-zinc-950 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
                    >
                        <HugeiconsIcon
                            icon={Download01Icon}
                            size={18}
                            strokeWidth={1.8}
                        />
                        Exportar PDF
                    </button>
                </header>

                <section className="grid grid-cols-1 gap-x-8 gap-y-7 border-b border-zinc-200 pb-8 sm:grid-cols-2 lg:grid-cols-4">
                    {indicators.map((indicator) => (
                        <div key={indicator.label} className="space-y-2">
                            <p className="text-sm text-zinc-500">
                                {indicator.label}
                            </p>

                            <p className="text-2xl font-semibold tracking-tight text-zinc-950">
                                {indicator.value}
                            </p>

                            <p className="text-xs text-zinc-400">
                                {indicator.description}
                            </p>
                        </div>
                    ))}
                </section>

                <section className="space-y-4">
                    <h2 className="text-base font-semibold text-zinc-950">
                        Resultado estimado
                    </h2>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                            <p className="text-sm text-zinc-500">
                                Resultado após taxas
                            </p>

                            <p className="text-2xl font-semibold tracking-tight text-zinc-950">
                                {formatCurrency(report.netRevenue)}
                            </p>

                            <p className="text-xs text-zinc-400">
                                Receita de vendas menos taxas de pagamento.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm text-zinc-500">
                                Resultado após taxas e custos
                            </p>

                            <p className="text-2xl font-semibold tracking-tight text-zinc-950">
                                {formatCurrency(report.estimatedResult)}
                            </p>

                            <p className="text-xs text-zinc-400">
                                Receita menos taxas e custo dos produtos.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="text-base font-semibold text-zinc-950">
                        Taxas por modalidade de pagamento
                    </h2>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-150 text-left text-sm">
                            <thead>
                                <tr className="border-b border-zinc-200 text-xs text-zinc-500">
                                    <th className="py-3 pr-4 font-medium">
                                        Pagamento
                                    </th>
                                    <th className="px-4 py-3 text-right font-medium">
                                        Vendas
                                    </th>
                                    <th className="px-4 py-3 text-right font-medium">
                                        Receita
                                    </th>
                                    <th className="px-4 py-3 text-right font-medium">
                                        Taxa
                                    </th>
                                    <th className="py-3 pl-4 text-right font-medium">
                                        Taxa estimada
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {report.paymentMethods.map((method) => {
                                    const payment = PAYMENT_METHODS.find(
                                        (item) => item.id === method.method,
                                    );

                                    return (
                                        <tr
                                            key={method.method}
                                            className="border-b border-zinc-100 last:border-0"
                                        >
                                            <td className="py-4 pr-4 font-medium text-zinc-800">
                                                {payment?.label ?? method.method}
                                            </td>

                                            <td className="px-4 py-4 text-right text-zinc-600">
                                                {method.salesCount}
                                            </td>

                                            <td className="px-4 py-4 text-right text-zinc-600">
                                                {formatCurrency(method.revenue)}
                                            </td>

                                            <td className="px-4 py-4 text-right text-zinc-600">
                                                {formatPercentage(method.feePercentage)}
                                            </td>

                                            <td className="py-4 pl-4 text-right font-medium text-zinc-800">
                                                {formatCurrency(method.estimatedFee)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>

                            <tfoot>
                                <tr className="border-t border-zinc-200">
                                    <td className="py-4 pr-4 font-semibold text-zinc-950">
                                        Total
                                    </td>

                                    <td className="px-4 py-4 text-right font-semibold text-zinc-950">
                                        {report.salesCount}
                                    </td>

                                    <td className="px-4 py-4 text-right font-semibold text-zinc-950">
                                        {formatCurrency(report.revenue)}
                                    </td>

                                    <td className="px-4 py-4" />

                                    <td className="py-4 pl-4 text-right font-semibold text-zinc-950">
                                        {formatCurrency(report.estimatedFees)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </section>
            </main>
        );
    }

    return (
        <main className="space-y-10">
            <header className="space-y-1">
                <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
                    Financeiro
                </h1>

                <p className="text-sm text-zinc-500">
                    Configure suas taxas e gere relatórios financeiros.
                </p>
            </header>

            <section className="space-y-5">
                <div>
                    <h2 className="text-base font-semibold text-zinc-950">
                        Taxas de pagamento
                    </h2>

                    <p className="mt-1 text-sm text-zinc-500">
                        Informe as taxas cobradas pelas modalidades de pagamento.
                        Os valores são utilizados somente neste relatório.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                    {PAYMENT_METHODS.map((payment) => (
                        <div key={payment.id} className="space-y-2">
                            <label
                                htmlFor={`fee-${payment.id}`}
                                className="text-sm font-medium text-zinc-800"
                            >
                                {payment.label}
                            </label>

                            <div className="relative">
                                <input
                                    id={`fee-${payment.id}`}
                                    type="text"
                                    inputMode="decimal"
                                    value={fees[payment.id]}
                                    onChange={(event) =>
                                        handleFeeChange(
                                            payment.id,
                                            event.target.value,
                                        )
                                    }
                                    className="h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 pr-10 text-sm text-zinc-950 outline-none transition-colors focus:border-zinc-500"
                                    placeholder="0,00"
                                />

                                <span className="absolute inset-y-0 right-3 flex items-center text-sm text-zinc-400">
                                    %
                                </span>
                            </div>

                            <p className="text-xs text-zinc-500">
                                {payment.description}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="space-y-5">
                <div>
                    <h2 className="text-base font-semibold text-zinc-950">
                        Período do relatório
                    </h2>

                    <p className="mt-1 text-sm text-zinc-500">
                        Selecione o intervalo de vendas que deseja analisar.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <label
                            htmlFor="start-date"
                            className="text-sm font-medium text-zinc-800"
                        >
                            Data inicial
                        </label>

                        <input
                            id="start-date"
                            type="date"
                            value={startDate}
                            max={endDate || undefined}
                            onChange={(event) => {
                                setStartDate(event.target.value);
                                setError(null);
                            }}
                            className="h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-700 outline-none focus:border-zinc-500"
                        />
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="end-date"
                            className="text-sm font-medium text-zinc-800"
                        >
                            Data final
                        </label>

                        <input
                            id="end-date"
                            type="date"
                            value={endDate}
                            min={startDate || undefined}
                            onChange={(event) => {
                                setEndDate(event.target.value);
                                setError(null);
                            }}
                            className="h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-700 outline-none focus:border-zinc-500"
                        />
                    </div>
                </div>

                {error && (
                    <p className="text-sm text-red-600" role="alert">
                        {error}
                    </p>
                )}

                <button
                    type="button"
                    onClick={handleGenerateReport}
                    disabled={isGenerating || !startDate || !endDate}
                    className="inline-flex h-11 items-center gap-2 rounded-lg bg-zinc-950 px-5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <HugeiconsIcon
                        icon={ChartBarLineIcon}
                        size={18}
                        strokeWidth={1.8}
                    />

                    {isGenerating ? "Gerando relatório..." : "Gerar relatório"}
                </button>
            </section>
        </main>
    );
}
