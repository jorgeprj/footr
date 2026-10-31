
"use client";

import { jsPDF } from "jspdf";

import type { FinancialReport } from "@/modules/finance/domain/financial-report";

const COLORS = {
    black: [24, 24, 27] as const,
    dark: [39, 39, 42] as const,
    zinc: [113, 113, 122] as const,
    light: [228, 228, 231] as const,
    background: [250, 250, 250] as const,
    green: [22, 101, 52] as const,
    greenLight: [240, 253, 244] as const,
    white: [255, 255, 255] as const,
};

const PAYMENT_LABELS: Record<string, string> = {
    pix: "Pix",
    cash: "Dinheiro",
    debit: "Debito",
    credit: "Credito a vista",
    installment: "Credito parcelado",
};

function formatCurrency(value: number): string {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(value);
}

function formatDate(value: string): string {
    return value.split("-").reverse().join("/");
}

function formatPercentage(value: number): string {
    return `${value.toLocaleString("pt-BR", {
        maximumFractionDigits: 2,
    })}%`;
}

function formatGeneratedAt(): string {
    return new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "long",
        timeStyle: "short",
    }).format(new Date());
}

export function exportFinancialReport(report: FinancialReport): void {
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 17;
    const contentWidth = pageWidth - margin * 2;

    const setColor = (
        color: readonly [number, number, number],
    ) => {
        doc.setTextColor(color[0], color[1], color[2]);
    };

    const setFillColor = (
        color: readonly [number, number, number],
    ) => {
        doc.setFillColor(color[0], color[1], color[2]);
    };

    const setDrawColor = (
        color: readonly [number, number, number],
    ) => {
        doc.setDrawColor(color[0], color[1], color[2]);
    };

    function drawLabel(
        text: string,
        x: number,
        y: number,
    ) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        setColor(COLORS.zinc);
        doc.text(text.toUpperCase(), x, y);
    }

    function drawMetric(
        label: string,
        value: string,
        description: string,
        x: number,
        y: number,
        width: number,
        highlight = false,
    ) {
        drawLabel(label, x, y);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(15);
        setColor(highlight ? COLORS.green : COLORS.black);

        doc.text(value, x, y + 9, {
            maxWidth: width,
        });

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        setColor(COLORS.zinc);

        doc.text(description, x, y + 15, {
            maxWidth: width,
        });
    }

    // Background
    setFillColor(COLORS.white);
    doc.rect(0, 0, pageWidth, pageHeight, "F");

    // Header
    doc.setFont("helvetica", "bolditalic");
    doc.setFontSize(23);
    setColor(COLORS.black);
    doc.text("Footr", margin, 23);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    setColor(COLORS.zinc);
    doc.text("FINANCIAL REPORT", pageWidth - margin, 19, {
        align: "right",
    });

    doc.setFontSize(9);
    doc.text("Relatorio financeiro", pageWidth - margin, 24, {
        align: "right",
    });

    setDrawColor(COLORS.light);
    doc.setLineWidth(0.3);
    doc.line(margin, 31, pageWidth - margin, 31);

    // Report period
    doc.setFont("helvetica", "bold");
    doc.setFontSize(19);
    setColor(COLORS.black);
    doc.text("Resumo financeiro", margin, 44);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    setColor(COLORS.zinc);
    doc.text(
        `${formatDate(report.period.startDate)} - ${formatDate(report.period.endDate)}`,
        margin,
        51,
    );

    // Main financial result
    const resultY = 62;
    const resultHeight = 42;

    setFillColor(COLORS.background);
    doc.roundedRect(
        margin,
        resultY,
        contentWidth,
        resultHeight,
        2,
        2,
        "F",
    );

    drawLabel("Resultado estimado apos taxas e custos", margin + 7, resultY + 9);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(25);
    setColor(
        report.estimatedResult >= 0
            ? COLORS.green
            : COLORS.black,
    );

    doc.text(
        formatCurrency(report.estimatedResult),
        margin + 7,
        resultY + 22,
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    setColor(COLORS.zinc);

    doc.text(
        "Receita de vendas - taxas de pagamento - custo dos produtos",
        margin + 7,
        resultY + 31,
    );

    // Financial indicators
    const metricsY = 119;
    const columnGap = 8;
    const metricWidth = (contentWidth - columnGap) / 2;

    drawMetric(
        "Receita bruta",
        formatCurrency(report.grossRevenue),
        "Valor antes dos descontos",
        margin,
        metricsY,
        metricWidth,
    );

    drawMetric(
        "Descontos",
        formatCurrency(report.discounts),
        "Descontos concedidos nas vendas",
        margin + metricWidth + columnGap,
        metricsY,
        metricWidth,
    );

    drawMetric(
        "Receita de vendas",
        formatCurrency(report.revenue),
        "Valor efetivamente recebido nas vendas",
        margin,
        metricsY + 29,
        metricWidth,
    );

    drawMetric(
        "Taxas estimadas",
        formatCurrency(report.estimatedFees),
        "Custos dos meios de pagamento",
        margin + metricWidth + columnGap,
        metricsY + 29,
        metricWidth,
    );

    drawMetric(
        "Custo dos produtos",
        formatCurrency(report.productCosts),
        "Custo registrado no momento da venda",
        margin,
        metricsY + 58,
        metricWidth,
    );

    drawMetric(
        "Lucro bruto",
        formatCurrency(report.grossProfit),
        "Receita de vendas menos custo dos produtos",
        margin + metricWidth + columnGap,
        metricsY + 58,
        metricWidth,
    );

    // Payment methods table
    const tableTitleY = 218;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    setColor(COLORS.black);
    doc.text("Detalhamento por pagamento", margin, tableTitleY);

    const tableX = margin;
    const tableY = 226;
    const tableWidth = contentWidth;
    const rowHeight = 8;

    const columns = {
        payment: tableX + 2,
        sales: tableX + 83,
        revenue: tableX + 112,
        fee: tableX + 143,
        cost: tableX + tableWidth - 2,
    };

    setFillColor(COLORS.background);
    doc.rect(tableX, tableY, tableWidth, rowHeight, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    setColor(COLORS.zinc);

    doc.text("PAGAMENTO", columns.payment, tableY + 5);
    doc.text("VENDAS", columns.sales, tableY + 5, {
        align: "right",
    });
    doc.text("RECEITA", columns.revenue, tableY + 5, {
        align: "right",
    });
    doc.text("TAXA", columns.fee, tableY + 5, {
        align: "right",
    });
    doc.text("CUSTO", columns.cost, tableY + 5, {
        align: "right",
    });

    let currentY = tableY + rowHeight;

    report.paymentMethods.forEach((method) => {
        setDrawColor(COLORS.light);
        doc.setLineWidth(0.2);
        doc.line(tableX, currentY + rowHeight, tableX + tableWidth, currentY + rowHeight);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        setColor(COLORS.dark);

        doc.text(
            PAYMENT_LABELS[method.method] ?? method.method,
            columns.payment,
            currentY + 5,
        );

        doc.text(
            String(method.salesCount),
            columns.sales,
            currentY + 5,
            { align: "right" },
        );

        doc.text(
            formatCurrency(method.revenue),
            columns.revenue,
            currentY + 5,
            { align: "right" },
        );

        doc.text(
            formatPercentage(method.feePercentage),
            columns.fee,
            currentY + 5,
            { align: "right" },
        );

        doc.text(
            formatCurrency(method.estimatedFee),
            columns.cost,
            currentY + 5,
            { align: "right" },
        );

        currentY += rowHeight;
    });

    // Total row
    setFillColor(COLORS.background);
    doc.rect(tableX, currentY, tableWidth, rowHeight + 1, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    setColor(COLORS.black);

    doc.text("TOTAL", columns.payment, currentY + 5);

    doc.text(
        String(report.salesCount),
        columns.sales,
        currentY + 5,
        { align: "right" },
    );

    doc.text(
        formatCurrency(report.revenue),
        columns.revenue,
        currentY + 5,
        { align: "right" },
    );

    doc.text(
        formatCurrency(report.estimatedFees),
        columns.cost,
        currentY + 5,
        { align: "right" },
    );

    // Footer
    const footerY = 278;

    setDrawColor(COLORS.light);
    doc.line(margin, footerY, pageWidth - margin, footerY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    setColor(COLORS.zinc);

    doc.text(
        "Relatorio gerado pelo Footr",
        margin,
        footerY + 6,
    );

    doc.text(
        `Gerado em ${formatGeneratedAt()}`,
        pageWidth - margin,
        footerY + 6,
        { align: "right" },
    );

    doc.setFontSize(6.5);
    doc.text(
        "Valores de taxas estimados conforme percentuais informados pelo usuario.",
        margin,
        footerY + 11,
    );

    const fileName = `footr-relatorio-financeiro-${report.period.startDate}-${report.period.endDate}.pdf`;

    doc.save(fileName);
}
