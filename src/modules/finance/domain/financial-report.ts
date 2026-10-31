
export type FinancialPaymentMethod =
    | "pix"
    | "cash"
    | "debit"
    | "credit"
    | "installment";

export type PaymentFees = Record<FinancialPaymentMethod, number>;

export type FinancialSaleItem = {
    unitCostSnapshot: number;
};

export type FinancialSale = {
    id: string;
    paymentMethod: FinancialPaymentMethod;
    status: "pending" | "completed" | "cancelled" | "refunded";
    subtotal: number;
    discountAmount: number;
    totalAmount: number;
    soldAt: string;
    items: FinancialSaleItem[];
};

export type PaymentMethodSummary = {
    method: FinancialPaymentMethod;
    salesCount: number;
    revenue: number;
    feePercentage: number;
    estimatedFee: number;
    netRevenue: number;
};

export type FinancialReport = {
    period: {
        startDate: string;
        endDate: string;
    };
    salesCount: number;
    grossRevenue: number;
    discounts: number;
    revenue: number;
    estimatedFees: number;
    netRevenue: number;
    productCosts: number;
    grossProfit: number;
    estimatedResult: number;
    paymentMethods: PaymentMethodSummary[];
};

const PAYMENT_METHODS: FinancialPaymentMethod[] = [
    "pix",
    "cash",
    "debit",
    "credit",
    "installment",
];

function roundCurrency(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
}

function sum(values: number[]): number {
    return roundCurrency(
        values.reduce((total, value) => total + value, 0),
    );
}

export function generateFinancialReport(
    sales: FinancialSale[],
    fees: PaymentFees,
    startDate: string,
    endDate: string,
): FinancialReport {
    if (!startDate || !endDate || startDate > endDate) {
        throw new Error("Período do relatório inválido.");
    }

    for (const method of PAYMENT_METHODS) {
        const fee = fees[method];

        if (!Number.isFinite(fee) || fee < 0 || fee > 100) {
            throw new Error(
                `A taxa de ${method} deve estar entre 0% e 100%.`,
            );
        }
    }

    const completedSales = sales.filter((sale) => {
        const saleDate = sale.soldAt.slice(0, 10);

        return (
            sale.status === "completed" &&
            saleDate >= startDate &&
            saleDate <= endDate
        );
    });

    const grossRevenue = sum(
        completedSales.map((sale) => sale.subtotal),
    );

    const discounts = sum(
        completedSales.map((sale) => sale.discountAmount),
    );

    const revenue = sum(
        completedSales.map((sale) => sale.totalAmount),
    );

    const productCosts = sum(
        completedSales.flatMap((sale) =>
            sale.items.map((item) => item.unitCostSnapshot),
        ),
    );

    const paymentMethods: PaymentMethodSummary[] =
        PAYMENT_METHODS.map((method) => {
            const methodSales = completedSales.filter(
                (sale) => sale.paymentMethod === method,
            );

            const methodRevenue = sum(
                methodSales.map((sale) => sale.totalAmount),
            );

            const feePercentage = fees[method];

            const estimatedFee = roundCurrency(
                methodRevenue * (feePercentage / 100),
            );

            return {
                method,
                salesCount: methodSales.length,
                revenue: methodRevenue,
                feePercentage,
                estimatedFee,
                netRevenue: roundCurrency(
                    methodRevenue - estimatedFee,
                ),
            };
        });

    const estimatedFees = sum(
        paymentMethods.map((method) => method.estimatedFee),
    );

    const grossProfit = roundCurrency(revenue - productCosts);

    return {
        period: {
            startDate,
            endDate,
        },
        salesCount: completedSales.length,
        grossRevenue,
        discounts,
        revenue,
        estimatedFees,
        netRevenue: roundCurrency(revenue - estimatedFees),
        productCosts,
        grossProfit,
        estimatedResult: roundCurrency(
            revenue - estimatedFees - productCosts,
        ),
        paymentMethods,
    };
}
