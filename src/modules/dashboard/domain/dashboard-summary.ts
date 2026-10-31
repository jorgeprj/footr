
export type DashboardSaleItem = {
    productDescriptionSnapshot: string;
};

export type DashboardSale = {
    id: string;
    totalAmount: number;
    soldAt: string;
    items: DashboardSaleItem[];
};

export type DailySalesSummary = {
    date: string;
    revenue: number;
    salesCount: number;
};

export type TopSellingProduct = {
    description: string;
    quantitySold: number;
};

export type DashboardSummary = {
    period: {
        startDate: string;
        endDate: string;
    };
    revenue: number;
    salesCount: number;
    averageTicket: number;
    availableProductsCount: number;
    isLowStock: boolean;
    lowStockThreshold: number;
    dailySales: DailySalesSummary[];
    topSellingProducts: TopSellingProduct[];
};

export const LOW_STOCK_THRESHOLD = 100;

function roundCurrency(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
}

function sum(values: number[]): number {
    return roundCurrency(
        values.reduce((total, value) => total + value, 0),
    );
}

function getDateRange(startDate: string, endDate: string): string[] {
    const dates: string[] = [];
    const currentDate = new Date(`${startDate}T00:00:00.000Z`);
    const lastDate = new Date(`${endDate}T00:00:00.000Z`);

    while (currentDate <= lastDate) {
        dates.push(currentDate.toISOString().slice(0, 10));
        currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }

    return dates;
}

export function generateDashboardSummary(
    sales: DashboardSale[],
    availableProductsCount: number,
    startDate: string,
    endDate: string,
): DashboardSummary {
    if (!startDate || !endDate || startDate > endDate) {
        throw new Error("Período do dashboard inválido.");
    }

    if (
        !Number.isInteger(availableProductsCount) ||
        availableProductsCount < 0
    ) {
        throw new Error("Quantidade de produtos disponíveis inválida.");
    }

    const revenue = sum(sales.map((sale) => sale.totalAmount));
    const salesCount = sales.length;

    const averageTicket = salesCount > 0
        ? roundCurrency(revenue / salesCount)
        : 0;

    const dailySalesMap = new Map<
        string,
        { revenue: number; salesCount: number }
    >();

    for (const date of getDateRange(startDate, endDate)) {
        dailySalesMap.set(date, {
            revenue: 0,
            salesCount: 0,
        });
    }

    const productSalesMap = new Map<string, number>();

    for (const sale of sales) {
        const saleDate = sale.soldAt.slice(0, 10);
        const dailySummary = dailySalesMap.get(saleDate);

        if (dailySummary) {
            dailySummary.revenue += sale.totalAmount;
            dailySummary.salesCount += 1;
        }

        for (const item of sale.items) {
            const description = item.productDescriptionSnapshot.trim();

            if (!description) continue;

            productSalesMap.set(
                description,
                (productSalesMap.get(description) ?? 0) + 1,
            );
        }
    }

    const dailySales = Array.from(dailySalesMap.entries()).map(
        ([date, summary]) => ({
            date,
            revenue: roundCurrency(summary.revenue),
            salesCount: summary.salesCount,
        }),
    );

    const topSellingProducts = Array.from(productSalesMap.entries())
        .map(([description, quantitySold]) => ({
            description,
            quantitySold,
        }))
        .sort((a, b) => b.quantitySold - a.quantitySold)
        .slice(0, 5);

    return {
        period: {
            startDate,
            endDate,
        },
        revenue,
        salesCount,
        averageTicket,
        availableProductsCount,
        isLowStock: availableProductsCount < LOW_STOCK_THRESHOLD,
        lowStockThreshold: LOW_STOCK_THRESHOLD,
        dailySales,
        topSellingProducts,
    };
}
